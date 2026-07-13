import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../Api"; 
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  MessageSquare,
  Clock,
  Globe,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  HelpCircle,
  Briefcase,
  Users,
  Zap
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try{
    const res =  api.post("/api/interview/user-feedback",{
        name: formData.name,
        email:formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category || "general",
    })}catch(err){
        console.log(err)
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general"
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "itagiabhi2006@gmail.com",
      desc: "We'll respond within 24 hours",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+91 9902805132",
      desc: "Mon-Fri from 9am to 6pm EST",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "Kittur,Belgaum",
      desc: "Kittur, Karnataka 591115",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      detail: "Monday - Friday",
      desc: "9:00 AM - 6:00 PM EST",
      gradient: "from-blue-500 to-cyan-600"
    }
  ];

  const categories = [
    { value: "general", label: "General Inquiry", icon: MessageSquare },
    { value: "support", label: "Technical Support", icon: HelpCircle },
    { value: "business", label: "Business Partnership", icon: Briefcase },
    { value: "career", label: "Careers", icon: Users }
  ];

  const faqs = [
    {
      question: "How does the video interview work?",
      answer: "Our AI-powered platform simulates real interview scenarios with video and audio. You can practice answering questions while our system analyzes your responses in real-time."
    },
    {
      question: "What kind of feedback do I receive?",
      answer: "You'll get detailed feedback on communication skills, body language, tone, content quality, and specific suggestions for improvement."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All your data is encrypted and we follow strict privacy protocols. Your interview recordings are stored securely and never shared without permission."
    },
    {
      question: "Can I try before purchasing?",
      answer: "Absolutely! We offer a free trial that includes 3 practice interviews so you can experience the platform before committing."
    }
  ];

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "#", color: "hover:text-blue-400" },
    { icon: Linkedin, label: "LinkedIn", href: "#", color: "hover:text-blue-600" },
    { icon: Facebook, label: "Facebook", href: "#", color: "hover:text-blue-500" },
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:text-pink-500" }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Get In Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              We'd Love to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hear From You
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions about our video interview platform? Need help getting started? 
              Our team is here to support your journey to interview success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="relative p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${info.gradient} mb-4 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    <p className="text-indigo-600 font-semibold mb-1">
                      {info.detail}
                    </p>
                    <p className="text-sm text-gray-600">
                      {info.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-200/50 shadow-xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600">
                      Thank you for reaching out. We'll respond within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What can we help you with?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <label
                              key={cat.value}
                              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                formData.category === cat.value
                                  ? "border-indigo-600 bg-indigo-50"
                                  : "border-gray-200 hover:border-indigo-300 bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={formData.category === cat.value}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <Icon className={`w-5 h-5 ${
                                formData.category === cat.value ? "text-indigo-600" : "text-gray-400"
                              }`} />
                              <span className={`text-sm font-medium ${
                                formData.category === cat.value ? "text-indigo-600" : "text-gray-700"
                              }`}>
                                {cat.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                        placeholder="How can we help?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200 resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">FAQ</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600">
                  Quick answers to common questions about our platform
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                      <Zap className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Follow Us on Social Media
                </h3>
                <div className="flex justify-center gap-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className={`flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 text-gray-600 ${social.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Start Practicing Today</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Interviews?
              </h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of candidates using our AI-powered video interview platform
              </p>
              <button className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                <Sparkles className="w-6 h-6" />
                Try Free Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}