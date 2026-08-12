from django.test import TestCase, Client
from django.urls import reverse
from .models import Bio, Skill, Project, Experience, ContactMessage

class PortfolioTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.bio = Bio.objects.create(
            name="Test User",
            title="Tester",
            sub_title="Testing portfolio",
            about_text="Hi, I am a test biography description.",
            github_url="https://github.com",
            linkedin_url="https://linkedin.com",
            email="test@example.com"
        )
        self.skill = Skill.objects.create(
            name="Python",
            category="languages",
            proficiency=85,
            icon_class="fab fa-python",
            order=1
        )
        self.project = Project.objects.create(
            title="Test Project",
            description="Test description",
            tech_stack="Django, Test",
            order=1,
            is_featured=True
        )

    def test_home_view(self):
        response = self.client.get(reverse('portfolio:home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'portfolio/index.html')
        self.assertContains(response, "Test User")
        self.assertContains(response, "Test Project")

    def test_contact_submit_valid(self):
        url = reverse('portfolio:contact_submit')
        post_data = {
            'name': 'Visitor Name',
            'email': 'visitor@example.com',
            'subject': 'Hello',
            'message': 'This is a test message to portfolio owner.'
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, 200)
        
        json_data = response.json()
        self.assertEqual(json_data['status'], 'success')
        self.assertTrue(ContactMessage.objects.filter(email='visitor@example.com').exists())

    def test_contact_submit_invalid_email(self):
        url = reverse('portfolio:contact_submit')
        post_data = {
            'name': 'Visitor Name',
            'email': 'invalid-email',
            'subject': 'Hello',
            'message': 'This is a test message.'
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, 400)
        
        json_data = response.json()
        self.assertEqual(json_data['status'], 'error')
        self.assertIn('email', json_data['errors'])

    def test_api_neofetch(self):
        response = self.client.get(reverse('portfolio:api_neofetch'))
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data['OS'], 'Ubuntu 22.04 LTS') # Default os from models.py setup
        self.assertEqual(json_data['Email'], 'test@example.com')

    def test_api_projects(self):
        response = self.client.get(reverse('portfolio:api_projects'))
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(len(json_data['projects']), 1)
        self.assertEqual(json_data['projects'][0]['title'], 'Test Project')
