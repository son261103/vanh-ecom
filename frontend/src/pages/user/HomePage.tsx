import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Headphones, Star, ArrowRight, Zap, Heart, TrendingUp } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCatalogStore } from '../../store/catalogStore';
import { ProductCard } from '../../components/user/ProductCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const HomePage: React.FC = () => {
  const { featuredProducts, fetchFeaturedProducts } = useProductStore();
  const { categories, fetchCategories } = useCatalogStore();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories(false);
  }, []);

  const features = [
    {
      icon: Truck,
      title: 'Miễn phí vận chuyển',
      description: 'Cho đơn hàng từ 500.000đ',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Shield,
      title: 'Thanh toán bảo mật',
      description: 'Bảo mật thông tin 100%',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ 24/7',
      description: 'Luôn sẵn sàng hỗ trợ bạn',
      color: 'from-primary-500 to-rose-500',
    },
    {
      icon: Zap,
      title: 'Giao hàng nhanh',
      description: 'Nhận hàng trong 2-3 ngày',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Khách hàng thân thiết',
      content: 'Sản phẩm chất lượng, giao hàng nhanh. Tôi rất hài lòng với dịch vụ!',
      rating: 5,
    },
    {
      name: 'Trần Thị B',
      role: 'Khách hàng mới',
      content: 'Giá cả hợp lý, đóng gói cẩn thận. Chắc chắn sẽ quay lại mua tiếp!',
      rating: 5,
    },
    {
      name: 'Lê Văn C',
      role: 'Khách hàng VIP',
      content: 'Dịch vụ chăm sóc khách hàng tuyệt vời. Tôi đã giới thiệu cho bạn bè!',
      rating: 5,
    },
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative">
        <div
          className="relative bg-gradient-to-br from-primary-600 via-rose-500 to-primary-700 overflow-hidden"
          data-aos="fade-down"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full"></div>

          <div className="relative w-full px-4 sm:px-6 lg:px-12 py-20 md:py-32">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left" data-aos="fade-right">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <span className="text-white font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sản phẩm chất lượng cao
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  Mua sắm thông minh,
                  <br />
                  <span className="text-primary-100">Tiết kiệm hơn!</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
                  Khám phá hàng nghìn sản phẩm chất lượng với giá tốt nhất. 
                  Mua sắm dễ dàng, giao hàng nhanh chóng!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/user/products">
                    <button className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-gray-50 shadow-xl text-lg px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Khám phá ngay
                    </button>
                  </Link>
                  <Link to="/user/products">
                    <button className="inline-flex items-center justify-center border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105">
                      Xem ưu đãi
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 mt-8 md:mt-12 justify-center lg:justify-start">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white">1000+</p>
                    <p className="text-white/80 text-xs sm:text-sm">Sản phẩm</p>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30"></div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white">5000+</p>
                    <p className="text-white/80 text-xs sm:text-sm">Khách hàng</p>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30"></div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white">4.9★</p>
                    <p className="text-white/80 text-xs sm:text-sm">Đánh giá</p>
                  </div>
                </div>
              </div>
              
              <div className="relative hidden lg:block" data-aos="fade-left">
                <div className="relative z-10">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Product showcase images from Unsplash */}
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                        <img 
                          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" 
                          alt="Product 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" 
                          alt="Product 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop" 
                          alt="Product 3"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop" 
                          alt="Product 4"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary-200"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="w-full py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-white to-gray-50" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Khám phá các danh mục phổ biến
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.slice(0, 8).map((category, index) => (
              <Link
                key={category.id}
                to={`/user/products?category=${category.id}`}
                data-aos="flip-left"
                data-aos-delay={index * 50}
              >
                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
                  <div className="w-full aspect-square bg-gradient-to-br from-primary-100 to-rose-100 rounded-xl mb-4 flex items-center justify-center group-hover:from-primary-200 group-hover:to-rose-200 transition-all">
                    <ShoppingBag className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="w-full py-16 px-4 sm:px-6 lg:px-12 bg-gray-50" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Sản phẩm nổi bật
              </h2>
              <p className="text-gray-600 text-lg">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Link to="/user/products">
              <Button variant="outline" className="hidden md:flex">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <div
                key={product.id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 md:hidden">
            <Link to="/user/products">
              <Button>
                Xem tất cả sản phẩm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-12 py-16">
          <div className="max-w-7xl mx-auto" data-aos="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-gray-600 text-lg">
              Hàng nghìn khách hàng hài lòng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-12 bg-white" data-aos="zoom-in">
        <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-br from-primary-600 via-rose-500 to-primary-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 text-center py-16 px-6">
            <Heart className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bắt đầu mua sắm ngay hôm nay!
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật sản phẩm mới nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user/products">
                <button className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-gray-50 shadow-xl font-bold text-lg px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Khám phá ngay
                </button>
              </Link>
            </div>
          </div>
        </Card>
        </div>
      </section>
    </div>
  );
};
