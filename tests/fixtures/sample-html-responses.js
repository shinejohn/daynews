// Sample HTML responses for testing the ISR system
export const htmlResponses = {
  home: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riverside News - Your Local Source</title>
    <meta name="description" content="Stay informed with local news, events, and business updates from Riverside">
</head>
<body>
    <header>
        <h1>Riverside News</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/news">News</a>
            <a href="/events">Events</a>
            <a href="/business">Business</a>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h2>Welcome to Your Community News Source</h2>
            <p>Covering local news, events, and businesses in Riverside</p>
        </section>
        <section class="featured-articles">
            <h3>Featured Stories</h3>
            <article>
                <h4>Local Community Center Receives Major Renovation Grant</h4>
                <p>The Riverside Community Center has been awarded a $2.5 million grant...</p>
            </article>
        </section>
    </main>
</body>
</html>`,

  news: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest News - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>Latest News</h2>
        <div class="articles-grid">
            <article class="article-card">
                <h3>Community Center Renovation Grant</h3>
                <p>Local facility receives major funding...</p>
                <time>December 15, 2024</time>
            </article>
            <article class="article-card">
                <h3>New Downtown Farmers Market</h3>
                <p>Fresh produce and local goods coming Saturday...</p>
                <time>December 14, 2024</time>
            </article>
        </div>
    </main>
</body>
</html>`,

  about: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>About Riverside News</h2>
        <p>We've been serving the Riverside community since 2010, providing comprehensive coverage of local news, events, and business updates.</p>
        <section>
            <h3>Our Mission</h3>
            <p>To keep our community informed and connected through quality journalism and local reporting.</p>
        </section>
    </main>
</body>
</html>`,

  events: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Events - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>Upcoming Community Events</h2>
        <div class="events-calendar">
            <article class="event-card">
                <h3>Winter Holiday Festival</h3>
                <p>December 21, 2024 - Downtown Central Plaza</p>
                <p>Join us for live music, food vendors, and family activities...</p>
            </article>
            <article class="event-card">
                <h3>Small Business Saturday Market</h3>
                <p>December 30, 2024 - Community Center</p>
                <p>Support local businesses with 50+ vendors...</p>
            </article>
        </div>
    </main>
</body>
</html>`,

  business: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Directory - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>Local Business Directory</h2>
        <div class="business-categories">
            <section class="category">
                <h3>Restaurants & Cafés</h3>
                <div class="business-card">
                    <h4>Riverside Café</h4>
                    <p>123 Main Street - Fresh coffee and light meals</p>
                </div>
            </section>
            <section class="category">
                <h3>Technology Services</h3>
                <div class="business-card">
                    <h4>TechFlow Solutions</h4>
                    <p>456 Business Blvd - IT consulting and managed services</p>
                </div>
            </section>
        </div>
    </main>
</body>
</html>`,

  error404: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <a href="/">Return to Home</a>
    </main>
</body>
</html>`,

  error500: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Error - Riverside News</title>
</head>
<body>
    <header>
        <h1>Riverside News</h1>
    </header>
    <main>
        <h2>Server Error</h2>
        <p>We're experiencing technical difficulties. Please try again later.</p>
        <a href="/">Return to Home</a>
    </main>
</body>
</html>`
};

export default htmlResponses;