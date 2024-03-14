import axios from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {

    const { auth, setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        setAuth({
            user: response.data.username,
            accessToken: response.data.accessToken,
            role: response.data.role,
            surveyDisabled: response.data.surveyDisabled
        });

        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken