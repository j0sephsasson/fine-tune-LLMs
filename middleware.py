from flask import request, redirect

class RedirectToCustomDomainMiddleware:
    def __init__(self, app, custom_domain):
        self.app = app
        self.custom_domain = custom_domain

    def __call__(self, environ, start_response):
        if environ['HTTP_HOST'] != self.custom_domain:
            with self.app.request_context(environ):
                url = request.url.replace(f"http://{environ['HTTP_HOST']}", f"https://{self.custom_domain}", 1)
                response = redirect(url, code=301)
                return response(environ, start_response)
        return self.app(environ, start_response)