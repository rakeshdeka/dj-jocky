import Navbar from '../../components/navbar/navbar.component';

const Login = () => {
  //  const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = process.env.API_BASE_URL;
  console.log('API URL:', apiUrl);
  return (
    <div className="bg-[url('/image1.png')] font-[400] bg-cover bg-center min-h-screen">
      <Navbar />
      <div className="flex justify-center pt-56 gap-3 ">
        <div className='p-5 w-[580px] bg-[#00000075] rounded-md'>
          <h1 className='text-color-primary font-[400] font-MExtended text-[64px]'>Clients</h1>
          <p className='text-[14px] font-SFPro my-2' >Looking for your Futur courses and kits purchased from our online store? You’ll find them here in the Academy.</p>
          <button className='bg-color-secondary p-3  text-center text-[15px] font-MExtended rounded-md w-full '>Client Login</button>
        </div>
        <div className='p-5 w-[580px] bg-[#00000075] rounded-md'>
          <h1 className='text-color-primary font-[400] font-MExtended text-[64px]'>Designer</h1>
          <p className='text-[14px] font-SFPro my-2'>Looking for your Futur courses and kits purchased from our online store? You’ll find them here in the Academy.</p>
          <button className='bg-color-secondary p-3  text-center text-[15px] font-MExtended rounded-md w-full '>Designer Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
