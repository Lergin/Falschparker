<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <button id="signinButton" @click="login()">Registrieren mit Google</button>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script lang="ts">
/// <reference path="../../node_modules/@types/gapi.auth2/index.d.ts" />

import { Component, Vue } from 'vue-property-decorator'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import * as uuid from 'uuid/v1'
import firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

@Component
export default class Login extends Vue {
  mounted () {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.$router.push('/upload')
      }
    })
  }

  async login () {
    gapi.load('auth2', async function () {
      // TODO: switch between login and sign up to only create a new refresh token when necessarry

      gapi.auth2.authorize({
        client_id: '418563000081-k3sf7bmkvmh22p6cs0gf6oup1n0tjnc4.apps.googleusercontent.com',
        scope: 'profile https://www.googleapis.com/auth/gmail.send',
        prompt: 'consent',
        response_type: 'code id_token'
      }, async function ({ error, id_token: idToken, code }) {
        if (error) {
          // An error happened!
          console.error(error)
          return
        }

        const credential =  firebase.auth.GoogleAuthProvider.credential(idToken)
        const { user } = await  firebase.auth().signInAndRetrieveDataWithCredential(credential)

        if (!user) return

        const dataRef =  firebase.database().ref('users').child(user.uid).child('data')

        dataRef.child('code').set(code)
        dataRef.child('mailTo').set('anzeigenbussgeldstelle@owi-verkehr.hamburg.de')
        dataRef.child('name').set(user.displayName)
      })
    })
  }
}
</script>
