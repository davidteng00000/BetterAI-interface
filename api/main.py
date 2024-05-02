from openai import OpenAI
import os
import django

client = OpenAI(
  api_key=os.environ.get(".env"),
)


response = client.images.generate(
  model="dall-e-3",
  prompt="女高中生穿泳裝",
  size="1024x1024",
  quality="standard",
  n=1,
)

image_url = response.data[0].url
print(image_url)
