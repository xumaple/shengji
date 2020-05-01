"""Utility functions."""
import uuid
import hashlib

##### Constants #####

HASH_LENGTH = 16

#####################

def update_row(row, col_names, answers):
    for i, answer in enumerate(answers):
        setattr(row, col_names[i+2], answer)

def generate_unsalted_hash(text):
    return hashlib.md5(text).hexdigest()

ALGORITHM = 'sha512'
def generate_salted_hash(text, include_salt=True):
    """Account.py docstring."""
    salt = uuid.uuid4().hex
    hashed_text = get_hashed_text(salt, text)
    return "$".join([ALGORITHM, salt, hashed_text]) if include_salt == True else hashed_text

def get_hashed_text(salt, text):
    """Account.py docstring."""
    hash_obj = hashlib.new(ALGORITHM)
    hash_obj.update((salt + text).encode('utf-8'))
    return hash_obj.hexdigest()
