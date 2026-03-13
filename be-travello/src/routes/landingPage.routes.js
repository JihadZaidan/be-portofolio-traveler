const express = require('express');
const router = express.Router();
const landingPageController = require('../controllers/landingPage.controller');

// Public routes - for users
router.get('/', landingPageController.getLandingPage);

// Admin routes - for content management
router.get('/admin', landingPageController.getLandingPageAdmin);

// New routes for frontend compatibility
router.get('/landing-pages', landingPageController.getAllLandingPages);
router.post('/landing-pages', landingPageController.createLandingPageItem);
router.put('/landing-pages/:id', landingPageController.updateLandingPageItem);
router.delete('/landing-pages/:id', landingPageController.deleteLandingPageItem);

router.get('/hero-content', landingPageController.getHeroContents);
router.post('/hero-content', landingPageController.createHeroContent);
router.put('/hero-content/:id', landingPageController.updateHeroContent);
router.delete('/hero-content/:id', landingPageController.deleteHeroContent);

router.get('/home-pages', landingPageController.getHomePages);
router.put('/home-pages', landingPageController.upsertHomePages);

router.get('/hero-images', landingPageController.getHeroImages);
router.post('/hero-images', landingPageController.createHeroImage);
router.put('/hero-images/:id', landingPageController.updateHeroImage);
router.delete('/hero-images/:id', landingPageController.deleteHeroImage);

router.get('/about-items', landingPageController.getAboutItems);
router.post('/about-items', landingPageController.createAboutItem);
router.put('/about-items/:id', landingPageController.updateAboutItem);
router.delete('/about-items/:id', landingPageController.deleteAboutItem);

router.get('/faqs', landingPageController.getFaqs);
router.post('/faqs', landingPageController.createFaq);
router.put('/faqs/:id', landingPageController.updateFaq);
router.delete('/faqs/:id', landingPageController.deleteFaq);

router.get('/certifications', landingPageController.getCertifications);
router.post('/certifications', landingPageController.createCertification);
router.put('/certifications/:id', landingPageController.updateCertification);
router.delete('/certifications/:id', landingPageController.deleteCertification);

router.get('/services-list', landingPageController.getServicesList);
router.post('/services-list', landingPageController.createServiceItem);
router.put('/services-list/:id', landingPageController.updateServiceItem);
router.delete('/services-list/:id', landingPageController.deleteServiceItem);

router.get('/portfolio-items', landingPageController.getPortfolioItems);
router.post('/portfolio-items', landingPageController.createPortfolioItem);
router.put('/portfolio-items/:id', landingPageController.updatePortfolioItem);
router.delete('/portfolio-items/:id', landingPageController.deletePortfolioItem);

// Hero section
router.put('/hero', landingPageController.updateHero);

// Destinations
router.post('/destinations', landingPageController.addDestination);
router.put('/destinations/:id', landingPageController.updateDestination);
router.delete('/destinations/:id', landingPageController.deleteDestination);

// Services
router.post('/services', landingPageController.addService);
router.put('/services/:id', landingPageController.updateService);
router.delete('/services/:id', landingPageController.deleteService);

// Testimonials
router.post('/testimonials', landingPageController.addTestimonial);
router.put('/testimonials/:id', landingPageController.updateTestimonial);
router.delete('/testimonials/:id', landingPageController.deleteTestimonial);

// About section
router.put('/about', landingPageController.updateAbout);

// Contact section
router.put('/contact', landingPageController.updateContact);

// SEO
router.put('/seo', landingPageController.updateSeo);

module.exports = router;
