using Microsoft.EntityFrameworkCore;
using server.Entities;
using server.Database;
using Microsoft.AspNetCore.Mvc;
using server.Services.Interface;
using server.Services;
<<<<<<< HEAD
using DotNetEnv;
<<<<<<< HEAD
using Microsoft.AspNetCore.SignalR;
using SignalR.hub;
=======
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
>>>>>>> 56457f2c5bc3f1c91dc567425236213742a0d62f
=======
using System.Text.Json.Serialization;
>>>>>>> Rajdip

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
<<<<<<< HEAD

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo()
    {
        Title = "Web Api",
        Version = "v1"
    });

    option.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme()
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });

    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
             new OpenApiSecurityScheme
             {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id =  "Bearer"
                }
             },[]
        }
    });
});
=======
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddScoped<IUserInterface, UserService>();
builder.Services.AddScoped<IBookInterface, BookService>();
>>>>>>> Rajdip

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
);
builder.Services.AddSignalR();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.Password.RequiredLength = 8;
    opt.User.RequireUniqueEmail = true;
    opt.Password.RequireNonAlphanumeric = false;
    opt.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
}
).AddJwtBearer(
    options =>{
        options.TokenValidationParameters  = new TokenValidationParameters{
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["TokenSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["TokenSettings:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["TokenSettings:Token"]!)),
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddScoped<IUserInterface, UserService>();
<<<<<<< HEAD

builder.Services.AddScoped<IOrederInterface, OrderService>();

builder.Services.AddTransient<IEmailSender, EmailSenderService>();


builder.Services.AddSendGrid(options =>
    options.ApiKey = builder.Configuration["Sendgrid:SendGridKey"]!
);
=======
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
>>>>>>> aefc9c6d08b52442925a0e04a97b3c7ed2019597

// Env.Load();
// builder.Configuration["ConnectionStrings:DefaultConnection"] = Env.GetString("DB");
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    await SeedRoleService.SeedRoleAsync(roleManager);
    await SeedRoleService.SeedAdminAsync(userManager, roleManager);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationhub");
app.Run();
