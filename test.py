import secrets
import hashlib
from flask_bcrypt import Bcrypt
def generate_random_string(length=32):
    """生成指定长度的随机字符串"""
    random_bytes = secrets.token_bytes(length // 2)  # 长度减半，因为每个字节转换为两个十六进制字符
    hash_object = hashlib.sha256()
    hash_object.update(random_bytes)
    return hash_object.hexdigest()

def hash_string(string, algorithm="sha256"):
    """根据指定的算法计算字符串的哈希值"""
    hash_object = hashlib.new(algorithm)  # 创建哈希对象
    hash_object.update(string.encode())  # 添加字符串（需要编码为字节）
    return hash_object.hexdigest()  # 返回十六进制字符串表示

bcrypt = Bcrypt()
password = 'aaa'
hashed_password = bcrypt.generate_password_hash(password=password)
print(type(hashed_password))
check_password = bcrypt.check_password_hash(hashed_password, 'aaa')
print(f'check : {check_password}')