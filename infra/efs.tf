resource "aws_efs_file_system" "main" {
  creation_token = "${var.app_name}-efs"
  encrypted      = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name = "${var.app_name}-efs"
  }
}

resource "aws_efs_mount_target" "main" {
  count           = length(module.vpc.private_subnets)
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = module.vpc.private_subnets[count.index]
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_access_point" "nginx_config" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    gid = 101
    uid = 101
  }

  root_directory {
    path = "/nginx-config"
    creation_info {
      owner_gid   = 101
      owner_uid   = 101
      permissions = "755"
    }
  }
}

resource "aws_efs_access_point" "frontend_dist" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    gid = 101
    uid = 101
  }

  root_directory {
    path = "/frontend-dist"
    creation_info {
      owner_gid   = 101
      owner_uid   = 101
      permissions = "755"
    }
  }
}

resource "aws_efs_access_point" "uploads" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    gid = 1000
    uid = 1000
  }

  root_directory {
    path = "/uploads"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }
}

resource "aws_efs_access_point" "output" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    gid = 1000
    uid = 1000
  }

  root_directory {
    path = "/output"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }
}

resource "aws_efs_access_point" "static_files" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    gid = 101
    uid = 101
  }

  root_directory {
    path = "/static-files"
    creation_info {
      owner_gid   = 101
      owner_uid   = 101
      permissions = "755"
    }
  }
}
