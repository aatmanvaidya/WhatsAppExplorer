import requests
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from template import email_template
from datetime import datetime, timedelta

def mailer(to_emails, platform, section, dateMin, dateMax):

    API_ENDPOINT = "http://analysis-backend.whats-viral.me/misc/gettrending"

    sender_email = "beowulffz@gmail.com"
    sender_password = "xcxmdjzwtyarzkrg"
    sender_smtp_server = "smtp.gmail.com"
    sender_smtp_port = 587

    def element_template(data):
      if data["contentType"] == "image":
        return f"""
                <div style='margin: 7px 0;'>
                    <img alt='Descriptive Alt Text' height='auto' src='http://analysis-backend.whats-viral.me/{platform}/{data["content"]}' style='border:none;display:block;font-size:13px;height:auto;outline:none;text-decoration:none;max-width:250px; margin: auto;' width='140' />
                </div>
              """
      elif data["contentType"] == "message":
        return f"""
                <div style='margin: 7px 0;'>
                  {data['content']}
                </div>
              """
      elif data["contentType"] == "link":
        return f"""
                <div style='margin: 7px 0;'>
                  <a href="{data['content']}" style='color:#777777;'>
                    {data['content']}
                  </a>
                </div>
              """


    request_body = {
        "type": "forward",
        "platform": platform,
        "section": section,
        "dateMin": dateMin,
        "dateMax": dateMax,
        "limit": 3
    }
    response = requests.post(API_ENDPOINT, json=request_body)
    response_json = response.json()
    forwards_html = "{}".format("".join([f"""
                             <tr>
                                <td style='background-color:#ffffff;border:1px solid #ccc;padding:10px 20px;vertical-align:top;'>
                                  <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='' width='100%'>
                                    <tr>
                                      <td align='center' style='font-size:0px;padding:10px 25px;word-break:break-word;'>
                                        <div style='color:#777777;font-family:Oxygen, Helvetica neue, sans-serif;font-size:14px;line-height:21px;text-align:center;'>
                                          <div style='display:block; color: #ff6f6f; font-weight: bold; text-decoration: none;'>
                                            Message {i+1}
                                          </div>
                                          {element_template(data)}
                                          <div style='background:rgba(0,0,0,0.04); color:#ff6f6f; border-radius: 8px; padding: 3px;'>
                                            Forwards: {"Many" if platform == "whatsapp" and data['maxForwardingScore'] >= 127 else data['maxForwardingScore']}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>""" for i, data in enumerate(response_json)])) if len(response_json)>0 else """
            <div class='outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:center;vertical-align:top;width:100%;'>No new messages found!</div>
            """


    request_body = {
        "type": "message",
        "platform": platform,
        "section": section,
        "dateMin": dateMin,
        "dateMax": dateMax,
        "limit": 3
    }
    response = requests.post(API_ENDPOINT, json=request_body)
    response_json = response.json()
    messages_html = "{}".format("".join([f"""
                             <tr>
                                <td style='background-color:#ffffff;border:1px solid #ccc;padding:10px 20px;vertical-align:top;'>
                                  <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='' width='100%'>
                                    <tr>
                                      <td align='center' style='font-size:0px;padding:10px 25px;word-break:break-word;'>
                                        <div style='color:#777777;font-family:Oxygen, Helvetica neue, sans-serif;font-size:14px;line-height:21px;text-align:center;'>
                                          <div style='display:block; color: #ff6f6f; font-weight: bold; text-decoration: none;'>
                                            Message {i+1}
                                          </div>
                                          <div style='margin: 7px 0;'>
                                          {data['content']}
                                          </div>
                                          <div style='background:rgba(0,0,0,0.04); color:#ff6f6f; border-radius: 8px; padding: 3px;'>
                                            Frequency: {data['frequency']}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>""" for i, data in enumerate(response_json)])) if len(response_json)>0 else """
            <div class='outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:center;vertical-align:top;width:100%;'>No new messages found!</div>
            """

    request_body = {
        "type": "image",
        "platform": platform,
        "section": section,
        "dateMin": dateMin,
        "dateMax": dateMax,
        "limit": 3
    }
    response = requests.post(API_ENDPOINT, json=request_body)
    response_json = response.json()
    # print(response_json)
    images_html = "".join([f"""
                <div class='dys-column-per-25 outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:left;vertical-align:top;width:100%;'>
                  <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='vertical-align:top;' width='100%'>
                    <tr>
                      <td align='center' style='font-size:0px;padding:5px;word-break:break-word;'>
                        <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;border-spacing:0px;border-radius:5px; overflow: hidden;'>
                          <tbody>
                            <tr>
                              <td style='max-width:250px;'>
                                <img alt='Descriptive Alt Text' height='auto' src='http://analysis-backend.whats-viral.me/{platform}/{data["content"]}' style='border:none;display:block;font-size:13px;height:auto;outline:none;text-decoration:none;width:100%;' width='140' />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div style='background:rgba(0,0,0,0.04); color:#ff6f6f; padding: 3px; font-size: 14px; text-align: center;'>
                                  Frequency: {data['frequency']}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
            """ for data in response_json]) if len(response_json)>0 else """
            <div class='dys-column-per-25 outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:center;vertical-align:top;width:100%;'>No new images found!</div>
            """

    request_body = {
        "type": "link",
        "platform": platform,
        "section": section,
        "dateMin": dateMin,
        "dateMax": dateMax,
        "limit": 3
    }
    response = requests.post(API_ENDPOINT, json=request_body)
    response_json = response.json()
    links_html = "{}".format("".join([f"""
                            <tr>
                              <td style='background-color:#ffffff;border:1px solid #ccc;padding:10px 20px;vertical-align:top;'>
                                <table border='0' cellpadding='0' cellspacing='0' role='presentation' style='' width='100%'>
                                  <tr>
                                    <td align='center' style='font-size:0px;padding:10px 25px;word-break:break-word;'>
                                      <div style='color:#777777;font-family:Oxygen, Helvetica neue, sans-serif;font-size:14px;line-height:21px;text-align:center;'>
                                        <div style='display:block; color: #ff6f6f; font-weight: bold; text-decoration: none;'>
                                          Link {i+1}
                                        </div>
                                        <div style='margin: 7px 0;'>
                                          <a href="{data['content']}" style='color:#777777;'>
                                            {data['content']}
                                          </a>
                                        </div>
                                        <div style='background:rgba(0,0,0,0.04); color:#ff6f6f; border-radius: 8px; padding: 3px;'>
                                          Frequency: {data['frequency']}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                        """ for i, data in enumerate(response_json)])) if len(response_json)>0 else """
            <div class='outlook-group-fix' style='direction:ltr;display:inline-block;font-size:13px;text-align:center;vertical-align:top;width:100%;'>No new links found!</div>
            """


    # videos_html = "".join([f'<video src="{video}" controls></video>' for video in top_3_videos])
    # print(messages_html)
    # print(images_html)
    # print(links_html)
    date_range="{} - {}".format(datetime.strptime(dateMin, "%m-%d-%Y").strftime("%b %d, %Y"), datetime.strptime(dateMax, "%m-%d-%Y").strftime("%b %d, %Y"))
    email_body = email_template.format(date_range, forwards_html, messages_html, images_html, links_html)

    # msg = MIMEMultipart()
    # # msg.set_content(content, subtype="plain", charset='us-ascii')
    # msg['From'] = sender_email
    # # msg['To'] = ", ".join(to_emails)
    # # msg['Subject'] = "Your weekly digest: Top 3 Messages, Images, and Links"
    # msg['Subject'] = "Your weekly digest: [{}] {}".format(platform, section)

    # msg.attach(MIMEText(email_body, 'html'))

    # for image in top_3_images:
    #     with open(image, 'rb') as f:
    #         img = MIMEImage(f.read())
    #         img.add_header('Content-Disposition', 'attachment', filename=image)
    #         msg.attach(img)

    # # Connect to the SMTP server and send the email
    with smtplib.SMTP(sender_smtp_server, sender_smtp_port) as smtp_server:
        smtp_server.starttls()
        smtp_server.login(sender_email, sender_password)
        for recipient in to_emails:
          msg = MIMEMultipart()
          msg['From'] = sender_email
          msg['Subject'] = "Your weekly digest: [{}] {}".format(platform, section)
          msg.attach(MIMEText(email_body, 'html'))
          msg['To'] = recipient
          smtp_server.sendmail(sender_email, recipient, msg.as_string())
    
    print(f"Mail sent successfully: {platform} - {section}")

today = datetime.today().strftime("%m-%d-%Y")
one_week_ago = (datetime.today() - timedelta(days=7)).strftime("%m-%d-%Y")

to_emails = ['shlokpandey123@gmail.com']

for sec in ["test", "bharat", "anbar", "codeforafrica", "s1", "iaimpact"]:
  mailer(to_emails=to_emails, platform="whatsapp", section=sec, dateMin=one_week_ago, dateMax=today)

# for sec in ["test"]:
#   mailer(to_emails=to_emails, platform="telegram", section=sec, dateMin=one_week_ago, dateMax=today)