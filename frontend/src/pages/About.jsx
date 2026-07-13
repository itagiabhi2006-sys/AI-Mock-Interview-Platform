import React from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Zap, 
  Users, 
  Award, 
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Globe,
  Heart,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Brain,
      title: "Innovation",
      desc: "Leveraging cutting-edge AI technology to revolutionize interview preparation",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Excellence",
      desc: "Committed to delivering the highest quality feedback and learning experience",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Accessibility",
      desc: "Making professional interview preparation available to everyone, everywhere",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Heart,
      title: "Empowerment",
      desc: "Helping candidates build confidence and achieve their career goals",
      gradient: "from-blue-500 to-cyan-600"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Video & Audio Interviews",
      desc: "Practice with realistic video and audio mock interviews powered by AI"
    },
    {
      icon: Brain,
      title: "Real-time AI Analysis",
      desc: "Get instant feedback on your responses, body language, and communication"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      desc: "Your data is encrypted and secure. We prioritize your privacy"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      desc: "Practice anytime, anywhere at your own pace and convenience"
    },
    {
      icon: Globe,
      title: "Multi-domain Support",
      desc: "Covering 50+ career domains from tech to healthcare"
    },
    {
      icon: Award,
      title: "Proven Results",
      desc: "95% of our users report improved interview performance"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Mock Interviews" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Career Domains" }
  ];

  const team = [
    {
      name: "AI Research Team",
      desc: "PhDs and experts in Natural Language Processing and Machine Learning",
      icon: Brain
    },
    {
      name: "Career Coaches",
      desc: "Experienced HR professionals and interview specialists",
      icon: Users
    },
    {
      name: "Tech Engineers",
      desc: "Full-stack developers ensuring seamless user experience",
      icon: Lightbulb
    }
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
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">About InterviewAI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Transforming Interview Preparation with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              We're on a mission to democratize interview preparation by making world-class AI coaching 
              accessible to everyone. Practice with realistic video and audio mock interviews that help thousands of candidates land their dream jobs.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-6">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Empowering Candidates Through Technology
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We believe that everyone deserves a fair chance to succeed in their career journey. 
                That's why we've built an AI-powered platform that provides professional-grade interview 
                coaching at a fraction of traditional costs.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our advanced AI analyzes your video and audio responses in real-time, providing detailed feedback on 
                communication skills, body language, tone, and content quality. We're not just preparing 
                you for interviews—we're building your confidence for life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-32 h-32 text-indigo-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
              <Heart className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Core Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our values shape everything we do, from product development to customer support
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className="relative p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} mb-4 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Your Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in interviews, all in one powerful platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="p-6 bg-white rounded-2xl border border-gray-200/50 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-300">
                          <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Experts Behind the Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A diverse team of AI researchers, career coaches, and engineers working together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {member.name}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {member.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
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
                <Award className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Join Our Community</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of successful candidates who have transformed their interview skills with InterviewAI
              </p>
              <button className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                <Sparkles className="w-6 h-6" />
                Get Started Free
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