import { Role } from '../generated/client/client.ts';
import { prisma } from '../src/config/prisma.ts';
import bcrypt from 'bcryptjs';

// Removed local instantiation to use the shared singleton with adapter


async function main() {
    console.log('🌱 Starting database seed...');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 12);
    const hashedUserPassword = await bcrypt.hash('User123!', 12);

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedAdminPassword,
            role: Role.ADMIN,
        },
    });

    console.log('✅ Admin user created:', {
        email: admin.email,
        role: admin.role,
        password: 'Admin123!',
    });

    // Create Regular User
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: hashedUserPassword,
            role: Role.USER,
        },
    });

    console.log('✅ Regular user created:', {
        email: user.email,
        role: user.role,
        password: 'User123!',
    });

    // Create sample todos for the regular user
    await prisma.todo.createMany({
        data: [
            {
                title: 'Complete project documentation',
                description: 'Write comprehensive README and API docs',
                ownerId: user.id,
                completed: false,
            },
            {
                title: 'Review pull requests',
                description: 'Check pending PRs in the repository',
                ownerId: user.id,
                completed: true,
            },
            {
                title: 'Update dependencies',
                description: 'Run npm update and test',
                ownerId: user.id,
                completed: false,
            },
        ],
    });

    console.log('✅ Sample todos created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@example.com');
    console.log('     Password: Admin123!');
    console.log('   User:');
    console.log('     Email: user@example.com');
    console.log('     Password: User123!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
