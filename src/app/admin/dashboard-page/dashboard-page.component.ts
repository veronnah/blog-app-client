import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {PostsService} from "../../shared/posts.service";
import {Post} from "../../shared/interfaces";
import {Subscription} from "rxjs";
import {NotifierService} from "../shared/services/notifier.service";

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  public posts: Post[] | null | undefined;
  public displayedPosts: Post[] | null | undefined;

  public pSub: Subscription;
  public dSub: Subscription;

  public searchStr = '';
  public isTitleMatches: boolean;
  public loading: boolean;
  public submitted: boolean = false;

  public errorMessage: string;
  public nothingFoundMessage: string;
  public noPostsMessage: string;

  @ViewChildren('tableRow') tableRows: QueryList<any>;

  constructor(private postsService: PostsService,
              private notifierService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.getPosts();
  }

  public getPosts() {
    this.loading = true;
    this.postsService.getAll().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.displayedPosts = this.posts;
        this.loading = false;
        this.checkPosts();
      },
      error: () => {
        this.errorMessage = 'Something went wrong :(';
        this.loading = false;
      },
      complete: () => this.loading = false,
    });
  }

  private checkPosts() {
    if (!this.displayedPosts || !this.displayedPosts.length) {
      this.noPostsMessage = 'No posts yet';
    }
  }

  public remove(id: string, index: number, event: Event) {
    event.stopPropagation();
    this.submitted = true;

    const clickedRow = this.tableRows.toArray()[index].nativeElement;
    clickedRow.classList.add('deleted');

    this.postsService.remove(id).subscribe({
        next: () => {
          setTimeout(() => {
            this.displayedPosts = this.displayedPosts?.filter(post => post.id !== id);
            this.submitted = false;
          }, 1000);

          this.checkPosts();
        },
        error: () => this.submitted = false,
      }
    );

    // this.alert.warning('Post has been deleted');
    this.notifierService.showSnackbar('Post has been deleted', 'success');
  }

  public search(value: string) {
    if (!value.trim()) {
      this.displayedPosts = this.posts;
      this.nothingFoundMessage = '';
      return;
    }
    this.displayedPosts = this.posts?.filter(post => post.title.toLowerCase().includes(value) || post.title.includes(value));

    if (this.displayedPosts?.length === 0) {
      this.nothingFoundMessage = 'No posts found. Try to update search query';
    } else {
      this.nothingFoundMessage = '';
    }
  }

  ngOnDestroy() {
    if (this.pSub) {
      this.pSub.unsubscribe();
    }
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
  }
}
