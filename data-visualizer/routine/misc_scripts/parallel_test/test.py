import concurrent.futures
import time

def square(x):
    time.sleep(2)  # Simulate some computation time
    return x * x

def cube(x):
    time.sleep(2)  # Simulate some computation time
    return x * x * x

def add(a, b):
    time.sleep(2)  # Simulate some computation time
    return a + b

# Using ThreadPoolExecutor
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    # Submit the functions with arguments for execution
    future_square = executor.submit(square, 5)
    future_cube = executor.submit(cube, 3)

    # Wait for both functions to complete
    concurrent.futures.wait([future_square, future_cube])

    # Get the results
    result_square = future_square.result()
    result_cube = future_cube.result()

    print("ThreadPoolExecutor Results:")
    print(f"Square result: {result_square}")
    print(f"Cube result: {result_cube}")

# Using ProcessPoolExecutor
with concurrent.futures.ProcessPoolExecutor(max_workers=2) as executor:
    # Submit the functions with arguments for execution
    future_add = executor.submit(add, 10, 20)
    future_cube = executor.submit(cube, 2)

    # Wait for both functions to complete
    concurrent.futures.wait([future_add, future_cube])

    # Get the results
    result_add = future_add.result()
    result_cube = future_cube.result()

    print("\nProcessPoolExecutor Results:")
    print(f"Addition result: {result_add}")
    print(f"Cube result: {result_cube}")
