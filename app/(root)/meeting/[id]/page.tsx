'use client';
import Loader from '@/components/Loader';
import MeetingRoom from '@/components/MeetingRoom';
import MeetingSetUp from '@/components/MeetingSetup';
import { useGetCallById } from '@/hooks/UseGetCallById';
import { useUser } from '@clerk/nextjs'
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import React, { useState } from 'react'

const Meeting = ({params: {id}}: {params:{id:string}}) => {
  const {user, isLoaded} = useUser();
  const [isSetupCompleted, setIsSetupCompleted] = useState(false)
  const {call, isCallLoading} = useGetCallById(id)

  if(!isLoaded || isCallLoading) return <Loader/>

  return (
    <main className='h-screen w-full '>
      <StreamCall call={call}>
        <StreamTheme>
          {
            !isSetupCompleted ? (
              <MeetingSetUp setIsSetupCompleted={setIsSetupCompleted} />
            ):(
              <MeetingRoom/>
            )
          }
        </StreamTheme>
      </StreamCall>
    </main>
  )
}

export default Meeting