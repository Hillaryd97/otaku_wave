import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 p-6">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
          <h3 className="text-2xl font-bold">Explore OtakuWave</h3>
          <ul className="mt-4">
            <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Features</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Community Guidelines</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
          <h3 className="text-2xl font-bold">Stay Connected</h3>
          <ul className="mt-4">
            <li><a href="#" className="text-gray-300 hover:text-white">Facebook</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Twitter</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Instagram</a></li>
          </ul>
        </div>

        <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
          <h3 className="text-2xl font-bold">Join the Conversation</h3>
          <ul className="mt-4">
            <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Feedback</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Support</a></li>
          </ul>
        </div>

        <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
          <h3 className="text-2xl font-bold">Legal Stuff</h3>
          <ul className="mt-4">
            <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-8 text-gray-500">
        <p>&copy; 2023 OtakuWave. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
