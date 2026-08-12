from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import Bio, Skill, Project, Experience, ContactMessage

def get_default_bio():
    return Bio(
        name="John Doe",
        title="Full Stack Engineer",
        sub_title="Building the future of web apps",
        about_text="Hi! I am a passionate developer who loves code, command lines, and premium web design.",
        os_name="Ubuntu 22.04 LTS",
        host="PortfolioVM x86_64",
        kernel="Linux 5.15.0-generic",
        shell="zsh 5.8.1",
        de_wm="i3-gaps (X11)",
        terminal="Alacritty",
        cpu="Intel Core i7-12700H",
        memory="16GB / 32GB (50%)",
        github_url="https://github.com",
        linkedin_url="https://linkedin.com",
        email="demo@example.com"
    )

def home_view(request):
    bio = Bio.objects.first()
    if not bio:
        bio = get_default_bio()

    skills = Skill.objects.all().order_index() if hasattr(Skill.objects, 'order_index') else Skill.objects.all()
    # Simple sort just in case
    skills = sorted(skills, key=lambda s: (s.category, s.order))

    projects = Project.objects.all()
    experiences = Experience.objects.all()

    context = {
        'bio': bio,
        'skills': skills,
        'projects': projects,
        'experiences': experiences,
    }
    return render(request, 'portfolio/index.html', context)

@csrf_exempt
def contact_submit(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        subject = request.POST.get('subject', '').strip()
        message = request.POST.get('message', '').strip()

        errors = {}
        if not name:
            errors['name'] = 'Name is required'
        if not email:
            errors['email'] = 'Email is required'
        else:
            try:
                validate_email(email)
            except ValidationError:
                errors['email'] = 'Enter a valid email address'
        if not message:
            errors['message'] = 'Message is required'

        if errors:
            return JsonResponse({'status': 'error', 'errors': errors}, status=400)

        # Create contact message record
        msg = ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        return JsonResponse({
            'status': 'success',
            'message': 'Message sent successfully! I will get back to you shortly.'
        })

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def api_neofetch(request):
    bio = Bio.objects.first()
    if not bio:
        bio = get_default_bio()
    
    return JsonResponse({
        'OS': bio.os_name,
        'Host': bio.host,
        'Kernel': bio.kernel,
        'Shell': bio.shell,
        'DE/WM': bio.de_wm,
        'Terminal': bio.terminal,
        'CPU': bio.cpu,
        'Memory': bio.memory,
        'User': f"{bio.name.lower().replace(' ', '')}@portfolio",
        'Github': bio.github_url,
        'Linkedin': bio.linkedin_url,
        'Email': bio.email,
    })

def api_projects(request):
    projects = Project.objects.all()
    project_list = []
    for p in projects:
        project_list.append({
            'title': p.title,
            'description': p.description,
            'tech_stack': [t.strip() for t in p.tech_stack.split(',')],
            'github': p.github_url,
            'live': p.live_url,
            'image': p.image_url,
        })
    return JsonResponse({'projects': project_list})

def api_about(request):
    bio = Bio.objects.first()
    if not bio:
        bio = get_default_bio()
    return JsonResponse({
        'name': bio.name,
        'title': bio.title,
        'sub_title': bio.sub_title,
        'about': bio.about_text,
    })
