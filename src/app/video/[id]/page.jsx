import React from 'react'
import VideoPage from '@/component/videoPage'

const page = ({params}) => {
  return (
    <div>
      <VideoPage id={params.id}/>
    </div>
  )
}

export default page
