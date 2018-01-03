// @flow

import FB from 'fb'
import ServerConfigurationObject from './configuration'

import type { FacebookProfile } from './util/types'

export default class FacebookClient {
  extendFacebookAccessToken(facebookAccessToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
      FB.api('oauth/access_token', {
        client_id: ServerConfigurationObject.facebookClientAppId,
        client_secret: ServerConfigurationObject.facebookClientAppSecret,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: facebookAccessToken,
      }, res => {
        if (!res) {
          reject('Extend Facebook Token Error: Empty response')
          return
        }
        if (res.error) {
          reject('Extend Facebook Token Error: ' + res.error.message)
          return
        }
        resolve(res.access_token)
      })
    })
  }

  getProfile(facebookAccessToken: string): Promise<FacebookProfile> {
    return new Promise((resolve, reject) => {
      FB.api('me', {
        fields: 'id,first_name,last_name,email',
        access_token: facebookAccessToken
      }, res => {
        if (!res) {
          reject('Get Facebook Profile Error: Empty response')
          return
        }
        if (res.error) {
          reject('Get Facebook Profile Error: ' + res.error.message)
          return
        }
        resolve({
          facebookId: res.id,
          firstName: res.first_name,
          lastName: res.last_name,
          email: res.email,
        })
      })
    })
  }
}
