"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function GoogleSignInButton() {
  const router = useRouter();
  async function handleSignInWithGoogle(response: any) {
    console.log('Google sign-in callback triggered:', response);
    
    try {
      const token = response.credential
      const provider = 'google'

      console.log('Making request to backend for Google sign-in...');
      //make a fetch request to the backend providing the token and the provider
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/loginWithGoogle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, provider }),
        credentials: 'include'
      })
      
      const data = await res.json()
      console.log('Backend response:', data);
      console.log('Checking data now', data.user.status);

      if (data.user.status === 'success') {
        console.log('User signed in successfully:', data.user);
        //redirect to the home page
        router.push('/')
      } else {
        console.log('Error signing in with Google:', data.error);
        alert('Error signing in with Google')
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      alert('Error signing in with Google: ' + error);
    }
  }

  useEffect(() => {
    // Load Google One Tap script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google One Tap script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google One Tap script');
    };
    
    document.head.appendChild(script);

    // Expose the callback function to global scope
    (window as any).handleSignInWithGoogle = handleSignInWithGoogle;
    console.log('Google sign-in callback exposed to global scope');

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete (window as any).handleSignInWithGoogle;
    };
  }, []);

  return (
    <>
      <div id="g_id_onload"
           data-client_id="739241262888-h9lj5ge5lbp5vqdrdml2v80q3o9lg8c7.apps.googleusercontent.com"
           data-context="signin"
           data-ux_mode="popup"
           //data-login_uri="http://localhost:5001/users/loginWithGoogle"
           data-callback="handleSignInWithGoogle"
           data-auto_prompt="false"
           data-use_fedcm_for_prompt="true">
      </div>

      <div className="g_id_signin"
           data-type="standard"
           data-shape="rectangular"
           data-theme="outline"
           data-text="signin_with"
           data-size="large"
           data-logo_alignment="left">
      </div>
    </>
  );
}
