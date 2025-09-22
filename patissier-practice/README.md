# 🍰 Patissier Practice - AI-Powered Pastry Learning Platform

A comprehensive web application for learning pastry techniques with interactive quizzes, AI visual feedback, and personalized learning paths.

## ✨ Features

### 🎯 **Interactive Learning System**
- **Technique Library**: Comprehensive collection of pastry techniques with step-by-step guides
- **Learning Paths**: Structured courses from beginner to advanced levels
- **Progress Tracking**: Real-time progress monitoring and achievement system

### 🧠 **AI-Powered Features**
- **Visual Feedback**: Upload photos of your creations for instant AI analysis
- **Smart Recommendations**: Personalized technique suggestions based on your progress
- **Quality Assessment**: Detailed scoring on color, shape, texture, and technique

### 📚 **Interactive Quizzes**
- **Multiple Question Types**: Multiple choice, drag & drop, sequence, fill-in-the-blank, matching, and true/false
- **Adaptive Difficulty**: Questions adjust based on your skill level
- **Detailed Feedback**: Comprehensive explanations and improvement suggestions

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Beautiful themes for comfortable learning
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Live Demo

**[View Live Demo](https://ajtruckinginc.github.io/patissier-practice)**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **State Management**: React Context + Custom Hooks
- **AI Integration**: OpenAI API for visual analysis
- **Deployment**: GitHub Pages

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajtruckinginc/patissier-practice.git
   cd patissier-practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started
1. **Browse Techniques**: Explore the technique library to find techniques you want to learn
2. **Start Learning Paths**: Follow structured courses designed for your skill level
3. **Take Quizzes**: Test your knowledge with interactive quizzes
4. **Upload for Feedback**: Use the AI visual feedback system to get instant analysis of your creations

### AI Visual Feedback
1. Navigate to the "AI Visual Feedback" section
2. Upload a photo of your pastry creation
3. Get instant analysis with:
   - Overall quality score (0-100)
   - Detailed feedback on color, shape, texture, and technique
   - Specific improvement suggestions
   - Technique recommendations

## 🚀 Deployment

### GitHub Pages Deployment

1. **Configure Next.js for GitHub Pages**
   ```bash
   npm run build
   npm run export
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save and wait for deployment

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
patissier-practice/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   └── services/         # Business logic
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [OpenAI](https://openai.com/) for the AI capabilities
- [Lucide React](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact us at support@patissier-practice.com

---

**Happy Baking! 🍰✨**