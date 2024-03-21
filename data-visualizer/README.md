# DataVisualiser Tool

## Overview

The DataVisualiser tool is designed to process and visualize data collected from various sources, providing insights into shared content while ensuring user privacy. It comprises a pipeline for data processing, an Express JS server for hosting data, and a React JS dashboard for interactive visualization.

## Features

- **Data Processing Pipeline:** Daily scripts collect and process data, including extracting thumbnails, detecting nudity, and clustering similar content using Facebook's ThreatExchange library.
  
- **Clustering Media:** Utilizes tmk for video clustering and pdq for image clustering, ensuring efficient grouping of media content.
  
- **Data Scraping:** Extracts links from text messages, captions from media files, and generates unique identification codes for messages.
  
- **Miscellaneous Fixes:** Handles encoding issues, removes duplicates, and prepares data for storage.
  
- **Data Hosting:** Hosts processed data using an Express JS server and ElasticSearch server for efficient retrieval.
  
- **Dashboard:** Developed over React JS with Material-UI, providing components for user authentication, dynamic search, lazy data loading, and individual-group data display.

## Usage

1. **Data Processing:** Execute processing pipeline to extract, cluster, and prepare data for visualization.
  
2. **Hosting:** Host processed data using the Express JS server and ElasticSearch.
  
3. **Visualization:** Access the dashboard at [analysis.whats-viral.me](http://analysis.whats-viral.me/) to explore visualized data.

## Dashboard Features

- **User Authentication:** Secure login system for accessing personalized data.
  
- **Dynamic Filtering:** Filter data dynamically based on various criteria such as media type and group.
  
- **Contextual Information:** View message context, including timestamps and preceding/following messages.
  
- **Media Clustering:** Group captions of media files for easy exploration.
  
- **URL Copying:** Copy URLs of specific messages for future reference.
  
- **Search Functionality:** Quickly search based on text or timestamp to locate specific data items.
  
- **Infinite Scroll:** Load data items in chunks for a smooth user experience.

## Security

- **API Security:** Backend APIs are secured using JWT Tokens for safe communication.
  
- **Persistent Login:** JWT Tokens enable persistent login sessions using cookies.
  
- **Secure Backend Operations:** Express JS server handles critical backend operations securely.

## Dependencies

- **Express JS:** For backend server operations.
  
- **ElasticSearch:** For efficient data retrieval and search functionality.
  
- **React JS:** For building the interactive dashboard.
  
- **Material-UI:** UI components library for React JS.
