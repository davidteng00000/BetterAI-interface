from openai import OpenAI
import os
import django

client = OpenAI(
  	api_key=os.environ.get(".env"),
)


# response = client.images.generate(
#   model="dall-e-3",
#   prompt="女高中生穿泳裝",
#   size="1024x1024",
#   quality="standard",
#   n=1,
# )

# image_url = response.data[0].url
# print(image_url)


response = client.chat.completions.create(
 	 model="gpt-3.5-turbo",
 	 messages=[
		{"role": "system", "content": "You are a helpful assistant."},
		{"role": "user", "content": "早安，給我微積分公式，請多多使用粗體字"},
		# {"role": "assistant", "content": "早安，你媽死了"},
		# {"role": "user", "content": "什麼是機器學習? 用500字列點說明"}
  	]
)

print(response.choices[0].message.content)