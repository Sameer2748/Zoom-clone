'use client';
import React, { useState } from 'react'
import Image from 'next/image'
import HomeCard from './HomeCard';
import { useRouter } from 'next/navigation';
import MeetingModal from './MeetingModal';
import { useUser } from '@clerk/clerk-react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from './ui/use-toast';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input';

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'IsSchedulingMeeting' | 'IsJoiningMeeting' | 'IsInstantMeeting' | undefined>()
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  });
  const [callDetails, setCallDetails] = useState<Call>()
  const { toast } = useToast();

  const meetingLink =  `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  const createMeeting = async () => {
    if (!client || !user) return;

    try {

      if (!values.dateTime) {
        toast({ title: "select date and time" })
        return;
      }

      const id = crypto.randomUUID();

      const call = client.call('default', id)

      if (!call) throw new Error("failed to creating call");

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString()
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description
          }
        }
      })

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`)
      }

      toast({
        title: "Meeting Created"
      })
    } catch (error) {
      console.log(error);
      toast({ title: "Failes to create meeting" })
    }
  }

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard img="/icons/add-meeting.svg" title="New Meeting" description="Start an iinstant meeting" handleclick={() => setMeetingState('IsInstantMeeting')} className="bg-orange-1" />
      <HomeCard img="/icons/schedule.svg" title="Schedule Meeting" description="Plan your meeting meeting" handleclick={() => setMeetingState('IsSchedulingMeeting')} className="bg-blue-1" />
      <HomeCard img="/icons/recordings.svg" title="View Recordings" description="Check your Recordings Bro" handleclick={() => router.push('/recordings')} className="bg-purple-1" />
      <HomeCard img="/icons/join-meeting.svg" title="Join Meeting" description="Via invitation link" handleclick={() => setMeetingState('IsJoiningMeeting')} className="bg-yellow-1" />

      {!callDetails ? (
        <MeetingModal isOpen={meetingState === 'IsSchedulingMeeting'} onClose={() => setMeetingState(undefined)} Title='Create Meeting' handleClick={createMeeting} >
          <div className='flex flex-col gap-2.5'>
            <label htmlFor="" className='text-base text-normal leading-[22px] text-sky-2'>Add a description</label>
            <Textarea className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0' onChange={(e)=> setValues({ ...values, description: e.target.value })} />
          </div>
          <div className="flex flex-col w-full gap-2.5">
            <label htmlFor="" className='text-base text-normal leading-[22px] text-sky-2'>Slect date and time</label>
            <ReactDatePicker selected={values.dateTime} onChange={(date)=> setValues({...values, dateTime: date!})}  showTimeSelect timeFormat='HH:mm' timeIntervals={15} timeCaption='time' dateFormat="MMMM d,yyyy h:mm aa"   className='w-full rounded bg-dark-3 p-2 focus:outline-none' />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal isOpen={meetingState === 'IsSchedulingMeeting'} onClose={() => setMeetingState(undefined)} Title='Meeting created' className="class-center"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink); 
            toast({title:"link copied"})
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
        />
      )}
      <MeetingModal isOpen={meetingState === 'IsInstantMeeting'} onClose={() => setMeetingState(undefined)} Title='Start an Instant Meeting' className="class-center" buttonText="Start Meeting" handleClick={createMeeting} />
      <MeetingModal isOpen={meetingState === 'IsJoiningMeeting'} onClose={() => setMeetingState(undefined)} Title='Type the link here' className="class-center" buttonText="Join Meeting" handleClick={()=> router.push(values.link)} >
        <Input placeholder="Meeting Link" className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 " onChange={(e)=> setValues({...values, link: e.target.value}) } />
      </MeetingModal>
    </section>
  )
}

export default MeetingTypeList