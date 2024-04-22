import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { isMobile } from "react-device-detect";

import DataCard from "../../components/dataCard/DataCard";
import PopupContentBox from "../../components/popupContentBox/PopupContentBox";
import constants from "../../assets/constants";
import isAuth, { userType } from "../../lib/isAuth";

const urls = {
  images: `${constants.apiBaseUrl}/images`,
  // videos: `${constants.apiBaseUrl}/videos`,
  messages: `${constants.apiBaseUrl}/messages`,
  links: `${constants.apiBaseUrl}/links`,
  forwarded: `${constants.apiBaseUrl}/forwarded`
};

const ContentPage = ({ category,  setSyncTime }) => {
  const [data, setData] = useState([]);
  const [modalData, setModalData] = useState();
  const [flagData, setFlagData] = useState([]);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(-1);

  const [contentCount, setContentCount] = useState(0);
  const [contentCountLoaded, setContentCountLoaded] = useState(false);

  const fetchContentCount = () => {
    let query = `${urls[category]}/getcount`;
    console.log(query);
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        setContentCount(response.data)
        setContentCountLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  let cnt = 0;

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    setModalData();
  };
  const [dataLoader, setDataLoader] = useState(true);

  const [skipOffset, setSkipOffset] = useState(0);
  const [finished, setFinished] = useState(false);

  const [filterInput, setFilterInput] = useState({
    minDate: null,
    maxDate: null,
  });

  const [filter, setFilter] = useState({
    minDate: null,
    maxDate: null,
  });

  const fetchData = async (reset) => {
    let tmpFlagData = flagData;
    if (cnt == 0) {
      try {
        const res = await axios.get(`${constants.apiBaseUrl}/flags`, {
          headers: {
            Authorization: `Bearer ${isAuth()}`,
          },
        });
        const { data } = await res;
        setFlagData(data);
        console.log(data);
        tmpFlagData = data;
      } catch (e) {
        console.log(e);
      }
    }
    cnt = 1;

    let skipOffsetTemp = skipOffset;
    let dataTemp = [...data];
    if (reset) {
      setData([]);
      setFinished(false);
      setSkipOffset(0);
      skipOffsetTemp = 0;
      dataTemp = [];
    }
    let query = `${urls[category]}?skip=${skipOffsetTemp}&dateMin=${
      filter.minDate ? filter.minDate.toISOString() : ""
    }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}`;
    console.log(query);
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        for (let i in response.data) {
          for (let j in tmpFlagData) {
            console.log(tmpFlagData[j]);
            console.log(response.data[i]);
            console.log("----");
            if (tmpFlagData[j].contentId == response.data[i].id) {
              response.data[i]["isFlagged"] = true;
              response.data[i]["flagMessage"] = tmpFlagData[j]["message"];
              break;
            }
          }
        }
        console.log(response.data);
        setData([...dataTemp, ...response.data]);
        setDataLoader(false);
        if (response.data.length == 0) setFinished(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const fetchFlags = async () => {
  //   console.log(`${constants.apiBaseUrl}/flags`);
  //   try {
  //     const res = await axios.get(`${constants.apiBaseUrl}/flags`, {
  //       headers: {
  //         Authorization: `Bearer ${isAuth()}`,
  //       },
  //     });
  //     const { data } = await res;
  //     setFlagData(data);
  //     console.log(data);
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   return [];
  //   // axios
  //   //   .get(`${constants.apiBaseUrl}/flags`, {
  //   //     headers: {
  //   //       Authorization: `Bearer ${isAuth()}`,
  //   //     },
  //   //   })
  //   //   .then((response) => {
  //   //     setFlagData(response.data);
  //   //     console.log(response.data);
  //   //   })
  //   //   .catch((error) => {
  //   //     console.log(error);
  //   //   });
  // };

  // useEffect(() => fetchFlags(), []); // future fix: merge this with loader animation

  useEffect(() => {
    fetchData(false);
  }, [skipOffset]);

  useEffect(() => {
    fetchData(true);
  }, [filter]);


  // useEffect(() => {
  //   fetchMetaData();
  // }, [mdSkipOffset]);

  useEffect(() => {
    const query = `${constants.apiBaseUrl}/misc/latestMessageTimestamp`
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        if(response.data){
          setSyncTime(response.data["latestTimestamp"])
        }
      })
      .catch((error) => {
        console.log(error);
      });
    setContentCountLoaded(false);
    fetchContentCount();
  }, [])

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (!finished && offsetHeight + scrollTop >= scrollHeight) {
      setDataLoader(true);
      setSkipOffset(data.length);
    }
  };

  return (
    <>
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "20px",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label={isMobile ? "Start" : "Start Date"}
              value={filterInput.minDate}
              onChange={(newValue) => {
                newValue.set({
                  hour: 0,
                  minute: 0,
                  second: 0,
                  millisecond: 0,
                });
                setFilterInput({ ...filterInput, minDate: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} inputProps={{...params.inputProps, readOnly: true}} sx={{ margin: "0 5px" }} />
              )}
              inputFormat="DD/MM/yyyy"
              disabled={dataLoader}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label={isMobile ? "End" : "End Date"}
              value={filterInput.maxDate}
              onChange={(newValue) => {
                newValue.set({
                  hour: 23,
                  minute: 59,
                  second: 59,
                  millisecond: 999,
                });
                setFilterInput({ ...filterInput, maxDate: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} inputProps={{...params.inputProps, readOnly: true}} sx={{ margin: "0 5px" }} />
              )}
              inputFormat="DD/MM/yyyy"
              disabled={dataLoader}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            onClick={() => {
              setDataLoader(true);
              setFilter({ ...filterInput });
            }}
            disabled={dataLoader}
            sx={{ margin: "0 5px" }}
          >
            {isMobile ? "Apply" : "Apply Filter"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFilterInput({
                minDate: null,
                maxDate: null,
              });
              setFilter({
                minDate: null,
                maxDate: null,
              });
            }}
            disabled={dataLoader}
          >
            Reset
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            overflow: "auto",
            // height: isMobile ? "60vh" : "69vh",
            position: "relative",
          }}
          onScroll={handleScroll}
        >
          {data.length == 0 && !dataLoader && (
            <div style={{ padding: "40px" }}>No data found</div>
          )}
          {data.map((ele, index) => (
            <DataCard
              metadata={ele}
              onClick={() => {
                setModalData({ ...ele});
                setCurrentActiveIndex(index);
                setOpen(true);
              }}
              category={category}
            />
          ))}
          {dataLoader && <CircularProgress style={{ padding: "20px 40vw" }} />}
        </div>

        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "15px",
            boxSizing: "border-box",
            flex: 1
          }}>
          {contentCountLoaded && `${dataLoader ? "Processing" : `Processed ${data.length}`} results from ${contentCount.toLocaleString()} ${category!="forwarded" ? category : "items"}`}
          {contentCountLoaded && !dataLoader && !finished && <Button
            variant="outlined"
            onClick={() => {
              setDataLoader(true);
              setSkipOffset(data.length);
            }}
            disabled={dataLoader}
            sx={{ margin: "0 5px" }}
          >
            Load More
          </Button>}
          {
            finished && ". Loaded all results."
          }
          </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        {modalData && (
          <PopupContentBox
            category={modalData.contentType ? `${modalData.contentType}s` : category}
            modalData={modalData}
            handleClose={handleClose}
            isOpen={open}
            setData={setData}
            setModalData={setModalData}
            currentActiveIndex={currentActiveIndex}
            filter={filter}
            isForwarded={category=="forwarded"}
          />
        )}
      </Modal>
    </>
  );
};

export default ContentPage;
