import fetch from 'node-fetch';

// Define the base URL of your server
const baseUrl = 'http://localhost:3000';

// Helper function to check the status of a response
function checkStatus(response, expectedStatus, testName) {
    if (response.status === expectedStatus) {
        console.log(`✓ ${testName}`);
    } else {
        console.log(`✗ ${testName} - Expected ${expectedStatus}, got ${response.status}`);
    }
}

// Test suite
async function runTests() {
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
        let response = await fetch(`${baseUrl}/review`,{
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /review (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /review:', error);
    }

    // Test getting a single movie by ID (assuming ID is valid)
    try {
        let response = await fetch(`${baseUrl}/movie/66bb1a61f93b93eb80b89d3e`);
        checkStatus(response, 200, 'GET /movie/:id');
    } catch (error) {
        console.error('Error in GET /movie/:id:', error);
    }

    // Test the "For You" recommendations page (unauthenticated)
    try {
        let response = await fetch(`${baseUrl}/foryou`,{
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /foryou (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /foryou:', error);
    }

    // Test the payment page (unauthenticated)
    try {
        let response = await fetch(`${baseUrl}/payment`,{
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /payment (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /payment:', error);
    }
}

// Run the tests
runTests().then(() => {
    console.log('All tests executed.');
});
