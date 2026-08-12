from django.db import models

class Bio(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200, help_text="e.g. Full Stack Developer / Hacker")
    sub_title = models.CharField(max_length=200, blank=True, help_text="e.g. Building scalable web apps")
    about_text = models.TextField()
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    resume_url = models.CharField(max_length=255, blank=True, help_text="URL or path to resume")
    
    # Neofetch details to display in terminal ASCII art
    os_name = models.CharField(max_length=100, default="Ubuntu 22.04 LTS")
    host = models.CharField(max_length=100, default="PortfolioVM x86_64")
    kernel = models.CharField(max_length=100, default="Linux 5.15.0-generic")
    shell = models.CharField(max_length=100, default="zsh 5.8.1")
    de_wm = models.CharField(max_length=100, default="i3-gaps (X11)")
    terminal = models.CharField(max_length=100, default="Alacritty")
    cpu = models.CharField(max_length=100, default="Intel i7-12700H (20) @ 4.70GHz")
    memory = models.CharField(max_length=100, default="16GB / 32GB (50%)")

    class Meta:
        verbose_name_plural = "Biography"

    def __str__(self):
        return self.name

class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('tools', 'Tools/DevOps'),
        ('languages', 'Core Languages'),
    ]
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    proficiency = models.IntegerField(help_text="Percentage from 0 to 100")
    icon_class = models.CharField(max_length=100, help_text="FontAwesome class e.g., 'fab fa-python'")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['category', 'order', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.CharField(max_length=255, blank=True, help_text="Static image URL/path or absolute web link")
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    tech_stack = models.CharField(max_length=255, help_text="Comma-separated technologies used, e.g. Django, React, Postgres")
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.title

class Experience(models.Model):
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    start_date = models.CharField(max_length=100, help_text="e.g. Jan 2022")
    end_date = models.CharField(max_length=100, default="Present", help_text="e.g. Dec 2023 or Present")
    description = models.TextField(help_text="Description of achievements, use newline for list points")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return f"{self.role} at {self.company}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.name} - {self.email}"
