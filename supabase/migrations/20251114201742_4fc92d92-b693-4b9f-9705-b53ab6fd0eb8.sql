-- Assign admin role to admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('61f06c1a-bbf0-467d-8fdb-396efbb022c9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign client role to client user
INSERT INTO public.user_roles (user_id, role)
VALUES ('6399cdf9-c0d2-43a7-a928-d2f45de17dcc', 'client')
ON CONFLICT (user_id, role) DO NOTHING;