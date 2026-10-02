-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES & PRIVILEGE ESCALATION GUARDS
-- Prevent client users from escalating their own role to 'admin'
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify user role assignments.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_profile_role_update();

CREATE POLICY "Allow users to read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  public.is_admin() OR 
  (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
);

CREATE POLICY "Allow admins to create/delete profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- 2. PROJECTS POLICIES
CREATE POLICY "Allow users to view projects they belong to"
ON public.projects FOR SELECT
USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow admins full access to projects"
ON public.projects FOR ALL
USING (public.is_admin());

-- 3. MILESTONES POLICIES
CREATE POLICY "Allow users to view project milestones"
ON public.milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = milestones.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to milestones"
ON public.milestones FOR ALL
USING (public.is_admin());

-- 4. TASKS POLICIES
CREATE POLICY "Allow users to view project tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to update tasks they review (Approve/Request changes)"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to tasks"
ON public.tasks FOR ALL
USING (public.is_admin());

-- 5. TASK FILES POLICIES
CREATE POLICY "Allow users to view task files"
ON public.task_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    JOIN public.projects ON projects.id = tasks.project_id
    WHERE tasks.id = task_files.task_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to insert task files"
ON public.task_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    JOIN public.projects ON projects.id = tasks.project_id
    WHERE tasks.id = task_files.task_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to task files"
ON public.task_files FOR ALL
USING (public.is_admin());

-- 6. FILES POLICIES
CREATE POLICY "Allow users to view project files"
ON public.files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = files.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to upload project files"
ON public.files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = files.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to files"
ON public.files FOR ALL
USING (public.is_admin());

-- 7. FILE VERSIONS POLICIES
CREATE POLICY "Allow users to view file versions"
ON public.file_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.files
    JOIN public.projects ON projects.id = files.project_id
    WHERE files.id = file_versions.file_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to add file versions"
ON public.file_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.files
    JOIN public.projects ON projects.id = files.project_id
    WHERE files.id = file_versions.file_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to file versions"
ON public.file_versions FOR ALL
USING (public.is_admin());

-- 8. APPROVALS POLICIES
CREATE POLICY "Allow users to view project approvals"
ON public.approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = approvals.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to update approval states"
ON public.approvals FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = approvals.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to approvals"
ON public.approvals FOR ALL
USING (public.is_admin());

-- 9. APPROVAL AUDIT TRAIL POLICIES
CREATE POLICY "Allow users to view approval audit trail"
ON public.approval_audit_trail FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.approvals
    JOIN public.projects ON projects.id = approvals.project_id
    WHERE approvals.id = approval_audit_trail.approval_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to write audit logs"
ON public.approval_audit_trail FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.approvals
    JOIN public.projects ON projects.id = approvals.project_id
    WHERE approvals.id = approval_audit_trail.approval_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to audit trail"
ON public.approval_audit_trail FOR ALL
USING (public.is_admin());

-- 10. INVOICES POLICIES
CREATE POLICY "Allow users to view their project invoices"
ON public.invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = invoices.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to update invoice payment states"
ON public.invoices FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = invoices.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to invoices"
ON public.invoices FOR ALL
USING (public.is_admin());

-- 11. MESSAGES POLICIES
CREATE POLICY "Allow users to view messages from their project threads"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = messages.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to post messages to their project threads"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = messages.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to update read_by field in messages"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = messages.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

-- 12. MEETINGS POLICIES
CREATE POLICY "Allow users to view scheduled meetings"
ON public.meetings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = meetings.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to book meetings"
ON public.meetings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = meetings.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to meetings"
ON public.meetings FOR ALL
USING (public.is_admin());

-- 13. TICKETS POLICIES
CREATE POLICY "Allow users to view their project support tickets"
ON public.tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tickets.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to open support tickets"
ON public.tickets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tickets.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to reply/update status on their tickets"
ON public.tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tickets.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to tickets"
ON public.tickets FOR ALL
USING (public.is_admin());

-- 14. TICKET REPLIES POLICIES
CREATE POLICY "Allow users to view ticket replies"
ON public.ticket_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tickets
    JOIN public.projects ON projects.id = tickets.project_id
    WHERE tickets.id = ticket_replies.ticket_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to post ticket replies"
ON public.ticket_replies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets
    JOIN public.projects ON projects.id = tickets.project_id
    WHERE tickets.id = ticket_replies.ticket_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

-- 15. NOTIFICATIONS POLICIES
CREATE POLICY "Allow users to read their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow users to update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow users/admins to insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 16. CONTRACTS POLICIES
CREATE POLICY "Allow users to view their project contracts"
ON public.contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = contracts.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow users to sign their contracts"
ON public.contracts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = contracts.project_id AND (projects.client_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Allow admins full access to contracts"
ON public.contracts FOR ALL
USING (public.is_admin());

-- 17. NOTIFICATION PREFERENCES POLICIES
CREATE POLICY "Allow users to read their own notification preferences"
ON public.notification_preferences FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow users to update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Allow insertion of preferences during profile setup"
ON public.notification_preferences FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 18. TEAM ASSIGNMENTS POLICIES
CREATE POLICY "Allow admins to read/write team assignments"
ON public.team_assignments FOR ALL
USING (public.is_admin());

CREATE POLICY "Allow clients to read team assignments they are part of"
ON public.team_assignments FOR SELECT
USING (client_user_id = auth.uid());
