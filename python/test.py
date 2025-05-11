# Created by Mr. CV2 :) - GitHub: https://github.com/CamDevv/Advanced-Math-Test

import random
import re
import time
import os

def to_camel_case(name):
    return ' '.join(word.capitalize() for word in name.split())

# Load student information from students.txt
student_info = {}
students_file_path = "students.txt"
scores_file_path = "scores.txt"

if os.path.exists(students_file_path):
    with open(students_file_path, "r") as file:
        for line in file:
            name, student_id, completed_test = line.strip().split(":")
            student_info[name.strip()] = (student_id.strip(), completed_test.strip().lower() == 'true')

# Read test configuration from testconfig.txt
test_config = {}
test_config_file_path = "testconfig.txt"

if os.path.exists(test_config_file_path):
    with open(test_config_file_path, "r") as file:
        for line in file:
            if line.strip() and not line.startswith("#"):
                key, value = line.strip().split(":")
                test_config[key.strip()] = value.strip()

# Extract test parameters
num_questions = int(test_config.get("How Many Questions On The Test", 2))
test_focus = test_config.get("Test Focus", "ADDITION").upper()
if test_focus not in ["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION"]:
    print("Invalid test focus. Supported values are: ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION")
    exit()

# Extract range parameters
range_config = test_config.get("Range", "1,10")
range_min, range_max = map(int, range_config.split(','))

# Extract other configurations
student_id_length = int(test_config.get("Student ID Length", 8))
completion_message = test_config.get("Completion Message", "You have already completed the test. You cannot retake it.")

# Define question format based on test focus
if test_focus == "ADDITION":
    question_format = "{f1} + {f2} = "
elif test_focus == "SUBTRACTION":
    question_format = "{f1} - {f2} = "
elif test_focus == "MULTIPLICATION":
    question_format = "{f1} * {f2} = "
elif test_focus == "DIVISION":
    question_format = "{f1} / {f2} = "

# Generate test questions based on test focus
questions = []
for _ in range(num_questions):
    f1 = random.randint(range_min, range_max)
    f2 = random.randint(range_min, range_max)
    if test_focus == "ADDITION":
        answer = f1 + f2
    elif test_focus == "SUBTRACTION":
        answer = f1 - f2
    elif test_focus == "MULTIPLICATION":
        answer = f1 * f2
    elif test_focus == "DIVISION":
        if f2 == 0:  # Avoid division by zero
            f2 = 1
        answer = f1 // f2  # Use floor division for simplicity
    questions.append((f1, f2, answer))

print("MATH TEST")
print("======================")
print("")
test_taker_name = input("Enter your name: ")

# Check if the name contains digits
if re.search(r'\d', test_taker_name):
    print("The provided test taker name contains digits and is invalid.")
    exit()

# Check if the name consists of exactly two words
name_words = test_taker_name.split()
if len(name_words) != 2:
    print("The provided test taker name should consist of exactly two words.")
    exit()

# Check if the name is in camel case format
corrected_name = to_camel_case(test_taker_name)
if corrected_name != test_taker_name:
    test_taker_name = corrected_name

# Check if the student is in the student_info dictionary
if test_taker_name not in student_info:
    print("The provided test taker is not registered.")
    exit()

# Check if the student has already completed the test
if student_info[test_taker_name][1]:
    print(completion_message)
    exit()

# Prompt for student ID with validation
while True:
    student_id = input(f"Enter your Student ID ({student_id_length} digits): ")
    if len(student_id) != student_id_length or not student_id.isdigit():
        print(f"Invalid Student ID format. Please enter exactly {student_id_length} digits.")
    else:
        break

# Check if the provided student ID matches the one in student_info
if student_info[test_taker_name][0] != student_id:
    print("The provided Student ID does not match the registered ID for", test_taker_name)
    exit()

print("Taking test as:", test_taker_name)

# The Questions

start_time = time.time()  # Start timing the test

score_correctly_answered_questions = 0
score_incorrectly_answered_questions = 0
total_score = 0

for i, (f1, f2, answer) in enumerate(questions, start=1):
    attempt = input(f"Question {i}/{num_questions}: {question_format.format(f1=f1, f2=f2)}")
    if attempt.isdigit() and int(attempt) == answer:
        score_correctly_answered_questions += 1
        total_score += 1
    else:
        score_incorrectly_answered_questions += 1

end_time = time.time()  # End timing the test

# Calculate the time taken for the test
time_taken = end_time - start_time

# Mark the test as completed for the student
student_info[test_taker_name] = (student_id, True)
# Update students.txt with the completion status
with open(students_file_path, "w") as file:
    for name, (student_id, completed_test) in student_info.items():
        file.write(f"{name}:{student_id}:{completed_test}\n")

# Save test results to scores.txt
with open(scores_file_path, "a") as score_file:
    score_file.write(f"{test_taker_name} - {num_questions} - {range_min}-{range_max} - {total_score} - {score_correctly_answered_questions} - {score_incorrectly_answered_questions} - {time_taken:.2f}\n")

# Finally, showing the test taker their score and the time taken
print("")
print("TOTAL SCORE: " + str(total_score))
print("")
print("QUESTIONS ANSWERED CORRECTLY: " + str(score_correctly_answered_questions))
print("")
print("QUESTIONS ANSWERED INCORRECTLY: " + str(score_incorrectly_answered_questions))
print("")
print("TIME TAKEN: {:.2f} seconds".format(time_taken))
