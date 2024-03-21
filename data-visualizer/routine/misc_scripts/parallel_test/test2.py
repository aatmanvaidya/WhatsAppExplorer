import concurrent.futures
import time
from multiprocessing import Manager

def square(x):
    time.sleep(2)  # Simulate some computation time
    return x * x

def cube(x):
    time.sleep(2)  # Simulate some computation time
    return x * x * x

def add(a, b, c):
    time.sleep(2)  # Simulate some computation time
    c["h"] = 5
    return a + b

# Define the function outside of test
def p(t):
    t += 1
    return t

def test():
    with concurrent.futures.ProcessPoolExecutor(max_workers=20) as executor:
        with Manager() as manager:
            # Create a shared dictionary
            tmp = manager.dict()

            t = 6

            # Submit the functions with arguments for execution
            future_add = executor.submit(add, 10, 20, tmp)
            future_cube = executor.submit(cube, 2)
            future_p1 = executor.submit(p, t)
            future_p2 = executor.submit(p, t)

            # Wait for all functions to complete
            concurrent.futures.wait([future_add, future_cube, future_p1, future_p2])

            # Get the results
            result_add = future_add.result()
            result_cube = future_cube.result()
            result_p1 = future_p1.result()
            result_p2 = future_p2.result()

            print(tmp)  # Access tmp after the tasks are completed
            print(result_p1, result_p2)
            print("\nProcessPoolExecutor Results:")
            print(f"Addition result: {result_add}")
            print(f"Cube result: {result_cube}")

        return 5

print(test())
