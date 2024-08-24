import fetch from 'node-fetch';

// Define the base URL of your server
const baseUrl = 'http://localhost:3000';

/**
 * Helper function to check the status of a response.
 * Logs whether the test passed or failed based on the expected status code.
 *
 * @param {Response} response - The response object from the fetch request.
 * @param {number} expectedStatus - The expected HTTP status code.
 * @param {string} testName - The name of the test for logging purposes.
 */
function checkStatus(response, expectedStatus, testName) {
    if (response.status === expectedStatus) {
        console.log(`✓ ${testName}`);
    } else {
        console.log(`✗ ${testName} - Expected ${expectedStatus}, got ${response.status}`);
    }
}

/**
 * Test suite to run GET requests against various routes.
 * This suite checks if the server responds correctly for different endpoints,
 * including home, signin, signup, and others.
 */
async function runGETTests() {
    // Test the root (home) page
    try {
        let response = await fetch(`${baseUrl}/`);
        checkStatus(response, 200, 'GET /');
    } catch (error) {
        console.error('Error in GET /:', error);
    }

    // Test the signin page
    try {
        let response = await fetch(`${baseUrl}/signin`);
        checkStatus(response, 200, 'GET /signin');
    } catch (error) {
        console.error('Error in GET /signin:', error);
    }

    // Test the signup page
    try {
        let response = await fetch(`${baseUrl}/signup`);
        checkStatus(response, 200, 'GET /signup');
    } catch (error) {
        console.error('Error in GET /signup:', error);
    }

    // Test the review page (unauthenticated)
    try {
        let response = await fetch(`${baseUrl}/review`, {
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /review (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /review:', error);
    }

    // Test getting a single movie by ID (assuming ID is valid)
    try {
        let response = await fetch(`${baseUrl}/movie/66bb1a61f93b93eb80b89d3e`); // this should be an existing movie id
        checkStatus(response, 200, 'GET /movie/:id');
    } catch (error) {
        console.error('Error in GET /movie/:id:', error);
    }

    // Test the "For You" recommendations page (unauthenticated)
    try {
        let response = await fetch(`${baseUrl}/foryou`, {
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /foryou (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /foryou:', error);
    }

    // Test the payment page (unauthenticated)
    try {
        let response = await fetch(`${baseUrl}/payment`, {
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /payment (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /payment:', error);
    }
}

/**
 * Test suite to run POST requests against various routes.
 * This suite checks if the server responds correctly for POST requests to signin and review routes.
 */
async function runPOSTTests() {
    // Example POST request to the /signin route with invalid user credentials
    let response = await fetch(`${baseUrl}/signin`, {
        redirect: 'manual',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            username: 'testuser',
            password: 'password123'
        }),
    });

    const responseBody = await response.text();
    // Check for the expected error message in the response
    if (response.status === 200 && responseBody.includes('User doesn&#39;t exist')) {
        console.log('✓ POST /signin (invalid user) - Correct error message');
    } else {
        console.log(`✗ POST /signin (invalid user) - Expected error message not found. Received: ${responseBody}`);
    }

    // Example POST request to the /review route with a valid user ID
    response = await fetch(`${baseUrl}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'userId=66bbaadecb57f6d30c65ad37',  // Authenticated user, this should be an existing user id
        },
        body: JSON.stringify({
            reviews: {
                movie1: 5,
                movie2: 4
            }
        })
    });

    // Check the status code of the response
    if (response.status === 200) {
        console.log('✓ POST /review passed');
    } else {
        console.log(`✗ POST /review - Expected 200, got ${response.status}`);
    }
}

// Run the GET tests
await runGETTests().then(() => {
    console.log('All GET tests executed.');
});

// Run the POST tests
runPOSTTests().then(() => {
    console.log('All POST tests executed.');
});
