import React from 'react';
import { Linkedin, Twitter, Github, Mail, Sparkles, Brain, MessageSquare, BookOpen } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 border-t border-gray-200/50 mt-16">
      {/* Decorative gradient blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-100/20 to-transparent pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InterviewAI</span>
                <span className="text-xs text-gray-500 font-medium">Mock Platform</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              AI-powered mock interviews to help you ace your next job opportunity. Practice, improve, and succeed.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Powered by Advanced AI</span>
            </div>
          </div>

          {/* Platform Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/interviews" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Mock Interviews</span>
                </a>
              </li>
              <li>
                <a href="/analysis" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Performance Analysis</span>
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">AI Feedback</span>
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Career Resources</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <span>Support</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">About Us</span>
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Contact Support</span>
                </a>
              </li>
              <li>
                <a href="/help" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Help Center</span>
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">FAQ</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal & Connect</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-1 group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Terms of Service</span>
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Follow Us</p>
              <div className="flex space-x-3">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-110">
                    <Linkedin className="h-4 w-4 text-white" />
                  </div>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 rounded-lg blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-110">
                    <Twitter className="h-4 w-4 text-white" />
                  </div>
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-110">
                    <Github className="h-4 w-4 text-white" />
                  </div>
                </a>
                <a 
                  href="mailto:support@interviewai.com"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-110">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>© {currentYear} InterviewAI Platform.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <a href="/sitemap" className="hover:text-indigo-600 transition-colors duration-200">Sitemap</a>
              <a href="/accessibility" className="hover:text-indigo-600 transition-colors duration-200">Accessibility</a>
              <a href="/cookies" className="hover:text-indigo-600 transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
    </footer>
  );
}