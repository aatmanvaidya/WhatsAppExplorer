// Imports the Google Cloud Data Loss Prevention library
const DLP = require("@google-cloud/dlp");
// const keys = require("../keys/core-depth-355012-98c6dbdcb90c.json");
const { encryptContact } = require("./hashing.js");

// Instantiates a client
const dlp = new DLP.DlpServiceClient();

class DeidentifyMessage {
  constructor() {
    this.tables = [this.getTable()]
    this.headers = [];
    this.tableIdx = 0;
    this.findings = [];
    this.processedFindings = {};
    this.data = {};
    this.dataCount = 0;
    this.charLimit = 20000;
    this.links = [];
  }

  getTable() {
    return {
      headers: [],
      rows: [],
    };
  }

  maskLinks(str) {
    // Replace links with $$LINK_LinkNumber$$ and store the link in a list this.links
    const regex = /\b(?:https?:\/\/|www\.)\S+\b/g;
    let match;
    let result = "";
    let start = 0;
    while ((match = regex.exec(str)) !== null) {
      result += str.substring(start, match.index);
      const link = match[0];
      const linkNumber = this.links.length;
      this.links.push(link);
      const hash = `$$WM_MASKED_LINK_${linkNumber}$$`;
      result += hash;
      start = match.index + match[0].length;
    }
    result += str.substring(start, str.length);
    return result;
  }

  recoverLinks() {
    // iterate through this.data and replace $$LINK_LinkNumber$$ with the link
    for (let field in this.data) {
      for (let row in this.data[field]) {
        let str = this.data[field][row];
        const regex = /\$\$WM_MASKED_LINK_(\d+)\$\$/g;
        let match;
        let result = "";
        let start = 0;
        while ((match = regex.exec(str)) !== null) {
          result += str.substring(start, match.index);
          const linkNumber = parseInt(match[1]);
          const link = this.links[linkNumber];
          result += link;
          start = match.index + match[0].length;
        }
        result += str.substring(start, str.length);
        this.data[field][row] = result;
      }
    }
  }

  addField(field) {
    const head = {
      name: field
    };
    this.headers.push(head);
    this.data[field] = [];
  }
  addRow(row) {

    for (const str of row) {
      this.dataCount += str.length;
    }

    if (this.dataCount > this.charLimit) {
      this.tables.push(this.getTable());
      this.tableIdx++;
      this.dataCount = 0;
    }

    const value = [];
    row.forEach((element, idx) => {
      let str = this.maskLinks(element);
      value.push({
        stringValue: str
      });
      this.data[this.headers[idx].name].push(str);
      // this.dataCount += element.length;
    });
    this.tables[this.tableIdx].rows.push({ values: value });
  }

  async inspect() {
    let offset = 0;
    for (const table of this.tables) {
      await this.inspectTable(table, offset);
      offset += table.rows.length;
    }
    this.processMatches();
  }

  async inspectTable(table, offset) {
    table.headers = this.headers;
    const item = { table: table };
    const maxFindings = 0;
    // Construct request
    const request = {
      // parent: `projects/${keys.project_id}/locations/global`,
      inspectConfig: {
        infoTypes: [
          {
            name: "PERSON_NAME",
          },
        ],
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
      },
      item: item,
    };
    const [response] = await dlp.inspectContent(request);
    await this.mergeDLPMatches(response.result.findings, table, offset);
  }

  getMatches(table, regex, type, offset) {
    const matches = [];
    table.rows.forEach((rowData, rowIdx) => {
      const row = rowData.values;
      row.forEach((cell, cellIdx) => {
        let match;
        while ((match = regex.exec(cell.stringValue)) !== null) {
          matches.push({
            type: type,
            likelihood: "VERY_LIKELY",
            fieldIndex: table.headers[cellIdx].name,
            rowIndex: offset + rowIdx,
            start: match.index,
            end: match.index + match[0].length,
            string: match[0],
          });
        }
      });
    });
    return matches;
  }

  async identifyPhoneEmail(table, offset) {
    const phoneRegex =
      /(?:\+?\d{1,3}\s)?\(?\d{2,3}\)?[\s.-]?\d{1,5}[\s.-]?\d{1,5}[\s.-]?\d{1,5}/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const phoneMatches = this.getMatches(table, phoneRegex, "PHONE_NUMBER", offset);
    const emailMatches = this.getMatches(table, emailRegex, "EMAIL_ADDRESS", offset);
    const matches = phoneMatches.concat(emailMatches);
    return matches;
  }

  async mergeDLPMatches(findings, table, offset) {
    findings.forEach(finding => {
      this.findings.push({
        type: finding.infoType.name,
        likelihood: finding.likelihood,
        fieldIndex: finding.location.contentLocations[0].recordLocation.fieldId.name,
        rowIndex: parseInt(finding.location.contentLocations[0].recordLocation.tableLocation.rowIndex) + offset,
        start: parseInt(finding.location.byteRange.start),
        end: parseInt(finding.location.byteRange.end),
      });
    });
    const matches = await this.identifyPhoneEmail(table, offset);
    this.findings = this.findings.concat(matches);
  }

  async processMatches() {
    this.findings.sort((a, b) => {
      return a.start - b.start;
    });
    this.findings.sort((a, b) => {
      return a.rowIndex - b.rowIndex;
    });
    this.mergeFindings();
    await this.hashData();
    this.recoverLinks();
  }

  mergeFindings() {
    // if there are intersections, then merge them
    for (let i = 0; i < this.findings.length; i++) {
      for (let j = i + 1; j < this.findings.length; j++) {
        if (this.findings[i].rowIndex === this.findings[j].rowIndex && this.findings[i].fieldIndex === this.findings[j].fieldIndex) {
          if (this.findings[i].end >= this.findings[j].start) {
            // compare likelihoods
            if (this.findings[i].likelihood === "VERY_LIKELY") {
              this.findings[i].end = this.findings[j].end;
              this.findings.splice(j, 1);
              j--;
            } else if (this.findings[j].likelihood === "VERY_LIKELY") {
              this.findings[j].start = this.findings[i].start;
              this.findings.splice(i, 1);
              i--;
              break;
            }
            else {
              this.findings[i].end = this.findings[j].end;
              this.findings.splice(j, 1);
              j--;
            }
          }
        }
      }
    }
    this.findings.forEach(finding => {
      if (!(finding.fieldIndex in this.processedFindings)) {
        this.processedFindings[finding.fieldIndex] = {};
      }
      if (!(finding.rowIndex in this.processedFindings[finding.fieldIndex])) {
        this.processedFindings[finding.fieldIndex][finding.rowIndex] = [];
      }
      this.processedFindings[finding.fieldIndex][finding.rowIndex].push([finding.start, finding.end]);
    });
  }

  async hashData() {
    for (let field in this.processedFindings) {
      for (let row in this.processedFindings[field]) {
        const matchData = this.processedFindings[field][row];
        matchData.sort((a, b) => {
          a[0] - b[0];
        });
        let start = 0;
        let end = 0;
        let result = "";
        const str = this.data[field][row];
        matchData.forEach(location => {
          end = location[0];
          result += str.substring(start, end);
          start = location[1];
          const substring = str.substring(end, start);
          if (substring !== " " && substring !== "") {
            const encrypted = encryptContact(substring);
            const encrypted_length = encrypted.length;
            const hash = `$$ENCRYPTED_${encrypted_length}[${encrypted}]$$`;
            result += hash;
          }
        });
        result += str.substring(start, str.length);
        this.data[field][row] = result;
      }
    }
  }
}

module.exports = {
  DeidentifyMessage,
};
