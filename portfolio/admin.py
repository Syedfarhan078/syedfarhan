from django.contrib import admin
from .models import Bio, Skill, Project, Experience, ContactMessage

@admin.register(Bio)
class BioAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'email')
    fieldsets = (
        ('Personal Info', {
            'fields': ('name', 'title', 'sub_title', 'about_text', 'email', 'resume_url')
        }),
        ('Social Links', {
            'fields': ('github_url', 'linkedin_url')
        }),
        ('System Spec (Neofetch)', {
            'fields': ('os_name', 'host', 'kernel', 'shell', 'de_wm', 'terminal', 'cpu', 'memory')
        }),
    )

    def has_add_permission(self, request):
        # Allow only one Bio instance
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'proficiency', 'order')
    list_filter = ('category',)
    search_fields = ('name',)
    list_editable = ('proficiency', 'order')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'tech_stack', 'is_featured', 'order')
    list_filter = ('is_featured',)
    search_fields = ('title', 'tech_stack')
    list_editable = ('is_featured', 'order')

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'start_date', 'end_date', 'order')
    list_editable = ('order',)
    search_fields = ('role', 'company', 'description')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    list_filter = ('created_at',)
    
    def has_add_permission(self, request):
        return False  # Messages should only come from frontend form submission
