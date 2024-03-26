const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const expect = chai.expect;

// Adjust the path to match where your `getCityName` function is defined
const { getCityName } = require('../public/getCurrentLocation.js');

describe('getCityName Function', function() {
    this.timeout(10000); 
    let axiosGetStub;

    beforeEach(() => {
        // Stub the axios.get function before each test to avoid making real HTTP requests
        axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
        // Restore the original axios.get function after each test to clean up
        axiosGetStub.restore();
    });

    it('should resolve with "Kelowna" on successful API response', async () => {
        const mockApiResponse = {
            data: {
                address: {
                    city: 'Kelowna'
                }
            }
        };

        // Mocking the axios.get call to return a successful response
        axiosGetStub.resolves(mockApiResponse);

        // Testing getCityName with mock latitude and longitude
        const cityName = await getCityName(49.8863, -119.4966);

        expect(cityName).to.equal('Kelowna');
    });

    it('should log an error when the city name is not found in the data', () => {
        // Simulating an API response without a city name
        axiosGetStub.returns(Promise.resolve({ data: {} }));
    
        // Testing getCityName with mock latitude and longitude
        return getCityName(123, 456)
            .then(() => {
                // This block should not be executed
                throw new Error('Expected error to be thrown');
            })
            .catch(error => {
                // Check if the error message is correct
                expect(error.message).to.equal('City name not found in the data');
            });
    });
    
    
    
    
    
    
});
