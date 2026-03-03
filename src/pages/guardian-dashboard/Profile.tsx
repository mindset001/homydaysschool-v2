import { useState } from 'react';
import { Link } from 'react-router-dom';

import ProfileImage from '../../assets/images/profile/profile-image.png';
import ProfileImageDesktop from '../../assets/images/profile/profile-image_desktop.png';
import CallImg from '../../assets/images/profile/call.png';
import MessageImg from '../../assets/images/profile/message.png';

const formatDate = (date: Date) => {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const MobileHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <header className='profile_header pb-[43.5px] ml:pb-[46px] md:p-0'>
      <div className='profile-box'>
        <p className='text-[22px] text-white font-bold font-Lora md:leading-[23.04px] leading-[28px]'>{title}</p>
        <div className='hidden px-6 py-1.5 bg-white rounded-[10px]'>
          <p className='text-[18px] text-clr1 font-bold font-Lora'>
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

const Student: React.FC = () => {
  const [studentIndex] = useState(0);

  // const toggleStudentFn: (index: number) => void = (index) => {
  //   setStudentIndex(index);
  // };

  const students = [
    {
      Name: 'Adaramola Victor Olusegun',
      ID: '7253D',
      Class: 'JSS 1A',
      DOB: '11-August-2007',
      Gender: 'Male',
      "Father's Name": 'Mr. Adaramola Sunday',
      "Father's Occupation": 'Banker',
      "Father's Contact": '08146279993',
      "Mother's Name": 'Mrs. Adaramola Sarah',
      "Mother's Occupation": 'Trader',
      "Mother's Contact": '09023456789',
      'Home Address': 'NO 23 Alaro Street, Ikare Road',
      "Guardian's Email Address": 'sarahmola@gmail.com',
      Hometown: 'Akure',
      'State of Origin': 'Ondo',
      Country: 'Nigeria',
      Religion: 'Christianity',
      "Starter's Pack": 'Collected',
    },
  ];

  const studentData: { [key: string]: string } = students[studentIndex];

  const studentProps = Object.keys(studentData).map((prop) => prop.toString());

  const studentId = studentData['ID'];
  const studentName = studentData['Name'];
  const studentClass = studentData['Class'];
  const age =
    new Date().getFullYear() - new Date(studentData['DOB']).getFullYear();

  const otherProps = studentProps.filter(
    (prop) =>
      prop !== 'Name' && prop !== 'ID' && prop !== 'Class' && prop !== 'DOB'
  );

  return (
    <section className=''>
      {/* mobile screen */}
      <div className='block md:hidden'>
        <MobileHeader title='Profile' subtitle='Student Database' />

        <div className='w-full h-fit relative bg-clr1 -z-10'>
          <div className='profile-section'>
            <div className='profile-thumbnail'>
              <div className='profile-picture'>
                <img
                  src={ProfileImage}
                  alt='profile image'
                  className='block scale-[1.5]'
                />
              </div>
            </div>

            <div className='w-full py-10 px-6'>
              <div className='flex flex-col gap-5 sm:gap-6'>
                {studentProps.map((prop: string, index: number) => {
                  const studentValue = studentData[prop];

                  const value: Date | string =
                    prop === 'DOB' ? new Date(studentValue) : studentValue;

                  const dateOfBirth =
                    value instanceof Date ? formatDate(value).split(' ') : [];

                  return (
                    <div
                      key={index}
                      className='flex justify-between items-start'
                    >
                      <p className='text-[13px] sm:text-[15px] font-Lora font-bold'>
                        {prop}
                      </p>
                      {value instanceof Date ? (
                        <div className='flex gap-2 sm:gap-3'>
                          {dateOfBirth.map((date: string, index: number) => (
                            <p key={index} className='student-details'>
                              {date}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className='student-details'>{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* desktop screen */}
      <div className='hidden md:block px-[30px]'>
        <div className='profile-wrapper-desktop'>
          <div className='profile-wrapper-picture-desktop'>
            <div className='w-full h-full flex justify-center items-center'>
              <img
                src={ProfileImageDesktop}
                alt='profile image'
                className='w-full h-full object-cover rounded-[20px]'
              />
            </div>
          </div>

          <div className='flex flex-col gap-10 w-full lg:basis-[45%] pl-10 pr-10 lg:pr-4 py-6 '>
            <div className='flex flex-col gap-3'>
              <p className='lg:text-[13px] xl:text-[18px] font-Poppins font-medium'>{`ID: ${studentId}`}</p>
              <div className='flex flex-col items-center gap-1.5'>
                <p className='lg:text-[23px] xl:text-[28px] font-Lora font-bold'>
                  {studentName.split(' ').splice(0, 2).join(' ')}
                </p>
                <p className='lg:text-[13px] xl:text-[18px] font-Poppins font-medium'>
                  {studentClass}
                </p>
                <div className='flex justify-center items-center gap-2'>
                  <button>
                    <img
                      src={CallImg}
                      alt='call'
                      className='size-3 xl:size-4'
                    />
                  </button>
                  <button>
                    <img
                      src={MessageImg}
                      alt='call'
                      className='width-3 h-auto xl:width-4'
                    />
                  </button>
                </div>
              </div>

              <div className='flex flex-col gap-1.5 xl:gap-2.5'>
                <div className='flex justify-between items-center'>
                  <p className='profile-student-prop'>Age:</p>
                  <p className='profile-student-value'>{age.toString()}</p>
                </div>
                {otherProps.map((prop, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center'
                  >
                    <p className='profile-student-prop'>{prop}:</p>
                    <p className='profile-student-value'>
                      {studentData[prop].toString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-end items-center'>
              <Link to='/' className='result-nav-link'>
                Result
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Student;
