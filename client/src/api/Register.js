import axios from "axios";
const api_url = "http://localhost:5129/api/user";
const registerService =
{
    registerUser: async (formdata) =>
        {
            try
            {
                const response = await axios.post(`${api_url}/register-user`,formdata);
                return response.data;
            }
            catch(error)
            {
                console.error('Error registering user', error);
                throw error;
            }
        }
}
export default registerService;