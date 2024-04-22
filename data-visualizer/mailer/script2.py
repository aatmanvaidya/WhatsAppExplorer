import requests
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from template import email_template

def mailer(platform, section, dateMin, dateMax):

    # Define the API endpoint URL
    API_ENDPOINT = "http://localhost:3434/misc/gettrending"

    # Define the list of email addresses to send the email to
    to_emails = ['gvrkirann@gmail.com', 'shlokpandey123@gmail.com']

    # Define the email sender's details
    sender_email = "beowulffz@gmail.com"
    sender_password = "xcxmdjzwtyarzkrg"
    sender_smtp_server = "smtp.gmail.com"
    sender_smtp_port = 587

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
    messages_html = "<ul>{}</ul>".format("".join([f"<li>{data['content']}</li>" for data in response_json]))

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
    images_html = "".join([f'<img src="http://analysis-backend.whats-viral.me/{platform}/{data["content"]}" />' for data in response_json])



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
    links_html = "<ul>{}</ul>".format("".join([f"<li>{data['content']}</li>" for data in response_json]))


    # videos_html = "".join([f'<video src="{video}" controls></video>' for video in top_3_videos])
    print(messages_html)
    print(images_html)
    print(links_html)
    email_body = email_template.format(messages_html, images_html, links_html)

    msg = MIMEMultipart()
    # msg.set_content(content, subtype="plain", charset='us-ascii')
    msg['From'] = sender_email
    msg['To'] = ", ".join(to_emails)
    msg['Subject'] = "Your monthly digest: Top 3 Messages, Images, and Links"

    msg.attach(MIMEText(email_body, 'html'))

    # # Attach each image to the email message
    # for image in top_3_images:
    #     with open(image, 'rb') as f:
    #         img = MIMEImage(f.read())
    #         img.add_header('Content-Disposition', 'attachment', filename=image)
    #         msg.attach(img)

    # # Connect to the SMTP server and send the email
    with smtplib.SMTP(sender_smtp_server, sender_smtp_port) as smtp_server:
        smtp_server.starttls()
        smtp_server.login(sender_email, sender_password)
        smtp_server.sendmail(sender_email, to_emails, msg.as_string())
    
    print("Mail sent successfully")

mailer(platform="telegram", section="test", dateMin="02-17-2023", dateMax="03-23-2023")