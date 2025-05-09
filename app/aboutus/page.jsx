"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { 
  Users, ShoppingBag, Store, Globe, 
  ArrowRight, Check, ChevronRight,
  Clock, Leaf, Heart, Award
} from 'lucide-react'

const AboutUs = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0, 
    totalFoodItems: 0,
    wasteReduction: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/aboutus', {
          method: 'GET',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Mission Section */}
      <MissionSection />
      
      {/* Stats Section */}
      <StatsSection stats={stats} />
      
      {/* Services Section */}
      <ServicesSection />

      {/* For Providers Section */}
      <ProvidersSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Contact CTA Section */}
      <ContactCTASection />
    </div>
  )
}

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-12">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-4"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Reducing Food Waste, <span className="text-primary">One Meal at a Time</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                We connect consumers with local businesses to save perfectly good food from going to waste, at a fraction of the original price.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="px-6" size="lg" asChild>
                <Link href="/">
                  Explore Foods <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#for-providers">
                  For Providers
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto lg:mx-0 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl"
          >
            <Image 
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Food waste reduction" 
              width={600}
              height={400}
              quality={100}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const MissionSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-12 md:py-20 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tackling Food Waste Together</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            We're on a mission to create a sustainable food ecosystem that reduces waste, helps businesses, and provides affordable meals to communities.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: Clock,
              title: "Last-Minute Savings",
              description: "We help businesses sell surplus food before it's too late, turning potential waste into affordable meals."
            },
            {
              icon: Leaf,
              title: "Environmental Impact",
              description: "Every meal saved means less waste in landfills and a significant reduction in greenhouse gas emissions."
            },
            {
              icon: Heart,
              title: "Community Support",
              description: "We're building a community that values sustainability, affordability, and reducing food waste together."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const StatsSection = ({ stats }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const statsItems = [
    { 
      icon: Users, 
      label: "Happy Users", 
      value: stats.totalUsers,
      suffix: "+",
      color: "text-blue-500" 
    },
    { 
      icon: Store, 
      label: "Provider Partners", 
      value: stats.totalProviders,
      suffix: "+",
      color: "text-emerald-500" 
    },
    { 
      icon: ShoppingBag, 
      label: "Food Items Saved", 
      value: stats.totalFoodItems,
      suffix: "+",
      color: "text-amber-500" 
    },
    { 
      icon: Leaf, 
      label: "Waste Reduction", 
      value: stats.wasteReduction,
      suffix: "kg",
      decimals: 0,
      color: "text-green-500" 
    },
  ]

  return (
    <section ref={ref} className="py-12 md:py-20 bg-muted/50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Impact</h2>
          <p className="mt-4 text-xl text-muted-foreground">Together we're making a difference</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="h-full border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`rounded-full p-3 bg-opacity-10 ${item.color.replace('text', 'bg')}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-center">
                    {inView && (
                      <>
                        <CountUp
                          start={0}
                          end={item.value || 0}
                          duration={2.5}
                          separator=","
                          decimals={item.decimals || 0}
                          decimal="."
                          useEasing={true}
                        />
                        {item.suffix}
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ServicesSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-12 md:py-20 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
          <p className="mt-4 text-xl text-muted-foreground">Simple steps to reduce food waste</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              step: "01",
              title: "Discover",
              description: "Browse surplus food from local businesses at discounted prices."
            },
            {
              step: "02",
              title: "Reserve",
              description: "Select and pay for your items through our secure platform."
            },
            {
              step: "03",
              title: "Pickup",
              description: "Collect your food from the business during the specified time window."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="relative"
            >
              <div className="border-t-4 border-primary pt-10 px-6">
                <div className="absolute top-0 -translate-y-1/2 left-0 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/explore">
              Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

const ProvidersSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="for-providers" ref={ref} className="py-12 md:py-20 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="mx-auto lg:mx-0 order-2 lg:order-1 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl"
          >
            <Image 
              src="https://plus.unsplash.com/premium_photo-1687697860831-edaf70e279dd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="For food providers" 
              width={600}
              height={400}
              quality={100}
              className="object-cover w-full h-full"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-4 order-1 lg:order-2"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">For Food Providers</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join our platform to reduce your food waste, reach new customers, and boost your revenue.
              </p>
            </div>
            
            <ul className="space-y-2">
              {[
                "Reduce food waste and associated costs",
                "Generate additional revenue from surplus food",
                "Attract eco-conscious customers",
                "Easy-to-use dashboard to manage your listings",
                "Be part of the sustainability movement"
              ].map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="pt-4">
              <Button size="lg" asChild>
                <Link href="/provider/apply">
                  Become a Provider <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const TeamSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const team = [
    // {
    //   name: "Emma Thompson",
    //   role: "Founder & CEO",
    //   image: "/team/founder.jpg"
    // },
    // {
    //   name: "Michael Chen",
    //   role: "Chief Technology Officer",
    //   image: "/team/cto.jpg"
    // },
    {
      name: "Rekar Jamal",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Delav Wria",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ]

  return (
    <section ref={ref} className="py-12 md:py-20 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Team</h2>
          <p className="mt-4 text-xl text-muted-foreground">Passionate about reducing food waste</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2  max-w-3xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <div className="text-center">
                <div className="mb-4 overflow-hidden rounded-full aspect-square mx-auto relative" style={{ width: "150px", height: "150px" }}>
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={150}
                    height={150}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ContactCTASection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-12 md:py-20 bg-primary/10">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Join the Movement?</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Whether you're a food provider or a conscious consumer, we'd love to have you on board.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                Find Food Near You
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutUs