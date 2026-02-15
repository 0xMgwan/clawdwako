import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, MessageSquare, ShoppingCart, Calendar, FileText, TrendingUp, Users, Zap, Star } from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Personal Assistant",
    description: "Your 24/7 AI assistant for scheduling, reminders, and general tasks",
    icon: Bot,
    category: "Productivity",
    features: ["Calendar integration", "Email management", "Task scheduling", "Smart reminders"],
    deployTime: "2 min",
    popularity: 95,
    price: "Free"
  },
  {
    id: 2,
    name: "Customer Support Bot",
    description: "Automated customer service with intelligent ticket routing",
    icon: MessageSquare,
    category: "Business",
    features: ["24/7 availability", "Multi-language", "Ticket routing", "Knowledge base"],
    deployTime: "3 min",
    popularity: 88,
    price: "$10/mo"
  },
  {
    id: 3,
    name: "E-commerce Assistant",
    description: "Sales bot for product recommendations and order processing",
    icon: ShoppingCart,
    category: "E-commerce",
    features: ["Product catalog", "Order tracking", "Payment processing", "Inventory alerts"],
    deployTime: "4 min",
    popularity: 82,
    price: "$15/mo"
  },
  {
    id: 4,
    name: "Crypto Trading Bot",
    description: "Automated trading with risk management and portfolio tracking",
    icon: TrendingUp,
    category: "Finance",
    features: ["Multi-exchange", "Risk management", "Portfolio tracking", "Alert system"],
    deployTime: "5 min",
    popularity: 91,
    price: "$25/mo"
  },
  {
    id: 5,
    name: "Content Creator",
    description: "AI writer for blogs, social media, and marketing content",
    icon: FileText,
    category: "Content",
    features: ["Multi-platform", "SEO optimization", "Brand voice", "Content calendar"],
    deployTime: "3 min",
    popularity: 76,
    price: "$12/mo"
  },
  {
    id: 6,
    name: "Community Manager",
    description: "Discord/Telegram community moderation and engagement",
    icon: Users,
    category: "Community",
    features: ["Auto-moderation", "Welcome messages", "Event scheduling", "Analytics"],
    deployTime: "2 min",
    popularity: 84,
    price: "$8/mo"
  }
];

const categories = ["All", "Productivity", "Business", "E-commerce", "Finance", "Content", "Community"];

export default function Templates() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ClawdWako</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/templates" className="text-blue-600 font-medium">Templates</a>
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            ⚡ Ready-to-deploy AI agents
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your AI Agent Template
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Pre-built, battle-tested AI agents ready to deploy in minutes. 
            From personal assistants to trading bots - we've got you covered.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="border-2 hover:border-blue-200 transition-all hover:shadow-lg group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{template.popularity}%</span>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4" />
                          <span>Deploy in {template.deployTime}</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {template.price}
                        </div>
                      </div>
                      
                      <Button className="w-full group-hover:bg-blue-700 transition-colors">
                        Deploy Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Don't See What You Need?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Request a custom template or build your own with our no-code builder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Request Custom Template
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-blue-600">
              Build Your Own
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">ClawdWako</span>
              </div>
              <p className="text-gray-400">
                Deploy AI agents with zero technical experience. Your own 24/7 AI employee, ready in minutes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <div className="h-5 w-5 bg-gray-400 hover:bg-white cursor-pointer rounded"></div>
                <div className="h-5 w-5 bg-gray-400 hover:bg-white cursor-pointer rounded"></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 ClawdWako. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
