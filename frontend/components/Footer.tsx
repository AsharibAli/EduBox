import { FaTwitter, FaGithub, FaTelegram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white shadow-md mt-8 py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <strong className="text-sm text-teal-600">
          &copy; 2024 EduBox |{" "}
          <a
            href="https://eduhub.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            EduHub
          </a>
          . All rights reserved.
        </strong>
        <div className="flex space-x-4 text-2xl">
          <a
            href="https://twitter.com/eduhub__"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter className="text-gray-600 hover:text-teal-500" />
          </a>
          <a
            href="https://github.com/EduHub-Dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="text-gray-600 hover:text-teal-500" />
          </a>
          <a
            href="https://t.me/+2LHHeOdkZvJmZWJk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTelegram className="text-gray-600 hover:text-teal-500" />
          </a>
        </div>
      </div>
    </footer>
  );
}
