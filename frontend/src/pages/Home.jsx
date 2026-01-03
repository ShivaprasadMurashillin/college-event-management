import { Link } from 'react-router-dom'
import { Calendar, Users, Award, TrendingUp, ArrowRight, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import RecommendedEvents from '../components/events/RecommendedEvents'

const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const stats = [
    { icon: Calendar, label: 'Events Hosted', value: '1500+', color: 'text-primary' },
    { icon: Users, label: 'Active Students', value: '5000+', color: 'text-accent' },
    { icon: Award, label: 'Certificates Issued', value: '2500+', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Success Rate', value: '95%', color: 'text-blue-500' },
  ]

  const categories = [
    { name: 'Technical', icon: '💻', color: 'bg-tech', count: '120+ Events' },
    { name: 'Cultural', icon: '🎭', color: 'bg-cultural', count: '85+ Events' },
    { name: 'Sports', icon: '⚽', color: 'bg-sports', count: '60+ Events' },
    { name: 'Workshops', icon: '📚', color: 'bg-workshop', count: '95+ Events' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {isAuthenticated && (
              <p className="text-2xl text-primary dark:text-accent font-semibold mb-4 animate-fade-in">
                Hi, {user?.name?.split(' ')[0]}! 👋
              </p>
            )}
            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 animate-fade-in">
              Discover. Register. <br />
              <span className="gradient-text">Participate. Excel.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in">
              Your gateway to exciting campus events, workshops, and competitions.
              Connect, learn, and grow with your college community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link
                to="/events"
                className="btn-primary justify-center text-lg px-8 py-4 shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Browse Events
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-outline justify-center text-lg px-8 py-4 shadow-lg"
                >
                  My Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-outline justify-center text-lg px-8 py-4 shadow-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading mb-4">Event Categories</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore events across different categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/events?category=${category.name.toLowerCase()}`}
                className="group bg-white dark:bg-gray-900 rounded-xl p-8 text-center card-hover"
              >
                <div className={`w-20 h-20 ${category.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to manage campus events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Register for events with just a few clicks. Track your registrations in one place.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital Certificates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive participation certificates automatically after attending events.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get event suggestions based on your interests and past participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Events Section - Only for authenticated users */}
      {isAuthenticated && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <RecommendedEvents />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center text-white">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl font-bold font-heading mb-4">
                Explore More Events
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Check out the latest events and register for what interests you
              </p>
              <Link
                to="/events"
                className="inline-flex items-center space-x-2 bg-white text-primary font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold font-heading mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of students discovering amazing campus events
              </p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-white text-primary font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all"
              >
                <span>Login Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
