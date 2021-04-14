using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<UserActivityDto>>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
        {
            private readonly IMapper _mapper;
            private readonly DataContext _context;
            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.Activities
                    .Include(x => x.Attendees)
                    .Where(x => x.Attendees.Any(a => a.AppUser.UserName == request.Username))
                    .OrderBy(a => a.Date)
                    .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                    .AsQueryable();

                query = request.Predicate switch
                {
                    "hosting" => query.Where(x => x.HostUsername == request.Username),
                    "past" => query.Where(x => x.Date < DateTime.UtcNow),
                    _ => query.Where(x => x.Date > DateTime.UtcNow),
                };

                return Result<List<UserActivityDto>>.Success(await query.ToListAsync());
            }
        }
    }
}