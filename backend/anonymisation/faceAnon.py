import cv2
import numpy as np
import base64
import os
import sys
import warnings

# hide deprication warnings
warnings.filterwarnings("ignore")


# # print present working directory
# print(os.getcwd())


# https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt
prototxt_path = "./anonymisation/weights/deploy.prototxt"
# https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/res10_300x300_ssd_iter_140000_fp16.caffemodel
model_path = "./anonymisation/weights/res10_300x300_ssd_iter_140000_fp16.caffemodel"
# load Caffe model
model = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)


image_ext = sys.argv[1]
folder = sys.argv[2]
# or
# image_b64 = get_sampleb64()
# image_ext = "jpeg"

# with open("whatsapp_analysis/test."+image_ext, "wb") as fh:
#     fh.write(base64.decodebytes(image_b64))

image_path = "./anonymisation/whatsapp_analysis/" + folder + "/test." + image_ext
anonymized_image_path = "./anonymisation/whatsapp_analysis/" + folder + "/_anon." + image_ext
image = cv2.imread(image_path)

# # First we check for NSFW content
# nsfw_probability = 0
# try:
#     nsfw_probability = n2.predict_image(image_path)
#     if nsfw_probability > 0.8:
#         Gaussian = cv2.GaussianBlur(image, (0, 0), 7)
#         cv2.imwrite(anonymized_image_path, Gaussian)
#         print("NSFW Anonymisation done!")
# except:
#     nsfw_probability = 1
#     print("NSFW Anonymisation failed!")


# if nsfw_probability <= 0.8:
try:
    # get width and height of the image
    h, w = image.shape[:2]
    # gaussian blur kernel size depends on width and height of original image
    kernel_width = (w // 7) | 1
    kernel_height = (h // 7) | 1
    # preprocess the image: resize and performs mean subtraction
    blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), (104.0, 177.0, 123.0))
    # set the image into the input of the neural network
    model.setInput(blob)
    # perform inference and get the result
    output = np.squeeze(model.forward())
    flag = False
    for i in range(0, output.shape[0]):
        confidence = output[i, 2]
        # get the confidence
        # if confidence is above 40%, then blur the bounding box (face)
        if confidence > 0.4:
            flag = True
            # get the surrounding box cordinates and upscale them to original image
            box = output[i, 3:7] * np.array([w, h, w, h])
            # convert to integers
            start_x, start_y, end_x, end_y = box.astype(np.int64)
            # get the face image
            face = image[start_y:end_y, start_x:end_x]
            # apply gaussian blur to this face
            face = cv2.GaussianBlur(face, (kernel_width, kernel_height), 0)
            # put the blurred face into the original image
            image[start_y:end_y, start_x:end_x] = face

    cv2.imwrite(anonymized_image_path, image)
    if flag:
        print("Face Anonymisation done!")
    else:
        print("No Anonymisation done!")
except:
    print("Face Anonymisation failed!")

sys.stdout.flush()
