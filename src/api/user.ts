import { UserAuth } from '../api';

class API {
    // This function interacts with insights.chrome instead of the automation
    // hub API. Since this UI will eventually be used outside of insights, where we
    // will likely get auth information from an API call, we're going to pretend
    // like the data is coming from the API to make this transition easier in the
    // future
    getCachedUser(): Promise<UserAuth> {
        return new Promise((resolve, reject) => {
            (window as any).insights.chrome.auth
                .getUser()
                // we don't care about entitlements stuff in the UI, so just
                // return the user's identity
                .then(result => resolve(result.identity))
                .catch(result => reject(result));
        });
    }
}

export const UserAPI = new API();
