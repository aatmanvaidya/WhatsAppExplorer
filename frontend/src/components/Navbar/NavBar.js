import React from 'react'

function NavBar() {
    return (
        <div className="flex bg-blue-100 p-3 min-h-min m-1 shadow-2xl shadow-blue-200 z-50 rounded-full sticky top-1">
            <div>
                <p className='font-bold'><span className='text-blue-500'>Whatsapp</span>Explorer</p>
            </div>
            <div className='ml-auto'>
                <div className='flex'>
                    {/* <a href="/images" className='font-medium text-right mr-3'>All Users</a> */}
                    <a href="/allUsers" className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>All Users</a>
                    <a href='/addUser' className='font-medium text-right mr-3 rounded-md backdrop-brightness-105 p-1 text-blue-500'>Add new User</a>
                    {/* <a href='/' className='font-medium text-right mr-3'>Texts</a> */}
                    {/* <a href='/' className='font-medium text-right mr-3'>Others</a> */}
                </div>
            </div>
        </div>
    )
}

export default NavBar