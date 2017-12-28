// @flow

import FB from 'fb'
import { FACEBOOK_CLIENT_APP_ID, FACEBOOK_CLIENT_APP_SECRET_ID } from '../constants'

type FacebookProfile = {
  facebookId: string,
  firstName: string,
  lastName: string,
}

export default class FacebookClient {
  extendFacebookAccessToken(facebookAccessToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
      FB.api('oauth/access_token', {
        client_id: FACEBOOK_CLIENT_APP_ID,
        client_secret: FACEBOOK_CLIENT_APP_SECRET_ID,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: facebookAccessToken,
      }, res => {
        if (!res) {
          reject('Extend Facebook Token Error: Empty response')
          return
        }
        if (res.error) {
          reject('Extend Facebook Token Error: ' + res.error)
          return
        }
        resolve(res.access_token)
      })
    })
  }

  getProfile(facebookAccessToken: string): Promise<FacebookProfile> {
    return new Promise((resolve, reject) => {
      FB.api('me', {
        fields: 'id,first_name,last_name',
        access_token: facebookAccessToken
      }, res => {
        if (!res) {
          reject('Get Facebook Profile Error: Empty response')
          return
        }
        if (res.error) {
          reject('Get Facebook Profile Error: ' + res.error)
          return
        }
        console.log('Get Profile Result:')
        console.log(res)
        resolve({
          facebookId: '1234',
          firstName: 'Miraan',
          lastName: 'Tabrez',
        })
      })
    })
  }
}
