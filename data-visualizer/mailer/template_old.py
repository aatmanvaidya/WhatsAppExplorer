email_template = """
<html>
  <head>
    <style>
      body {{
        font-family: sans-serif;
      }}
      h1, h2 {{
        color: #325288;
      }}
      .section {{
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #ddd;
      }}
      .section h2 {{
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 24px;
      }}
      .section ul {{
        list-style: none;
        margin: 0;
        padding: 0;
      }}
      .section li {{
        font-size: 18px;
        margin-bottom: 10px;
        padding-left: 20px;
        background: url('https://i.imgur.com/pGw2QjK.png') left center no-repeat;
      }}
      .media {{
        margin-bottom: 20px;
        text-align: center;
      }}
      .media img, .media video {{
        max-width: 100%;
        height: auto;
      }}
    </style>
  </head>
  <body>
    <h1>Top 3 Messages, Images, and Videos</h1>
    <div class="section">
      <h2>Top 3 Messages</h2>
      <ul>{}</ul>
    </div>
    <div class="section">
      <h2>Top 3 Images</h2>
      <div class="media">{}</div>
    </div>
    <div class="section">
      <h2>Top 3 Videos</h2>
      <div class="media">{}</div>
    </div>
  </body>
</html>
"""