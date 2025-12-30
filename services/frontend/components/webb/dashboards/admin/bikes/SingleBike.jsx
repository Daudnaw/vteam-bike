'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
//import { getAllUsers, updateUser } from '../../../../../../src/app/actions/user';

export default function SingleBike({ bikeId }) {
  

  return (
    <h2>{bikeId}</h2>
  );
}
